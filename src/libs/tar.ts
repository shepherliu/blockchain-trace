const recordSize = 512;

//header format
const headerFormat = [
	{ field: 'fileName', length: 100 },
	{ field: 'fileMode', length: 8 },
	{ field: 'uid', length: 8 },
	{ field: 'gid', length: 8 },
	{ field: 'fileSize', length: 12 },
	{ field: 'mtime', length: 12 },
	{ field: 'checksum', length: 8 },
	{ field: 'type', length: 1 },
	{ field: 'linkName', length: 100 },
	{ field: 'ustar', length: 8 },
	{ field: 'owner', length: 32 },
	{ field: 'group', length: 32 },
	{ field: 'majorNumber', length: 8 },
	{ field: 'minorNumber', length: 8 },
	{ field: 'filenamePrefix', length: 155 },
	{ field: 'padding', length: 12 },
];

const lookup = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
	'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
	'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
	'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
	'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
	'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
	'w', 'x', 'y', 'z', '0', '1', '2', '3',
	'4', '5', '6', '7', '8', '9', '+', '/',
];

//return a clean buffer
const clean = (length: number) => {
	const buffer = new Uint8Array(length);
	for (let i = 0; i < length; i += 1) {
		buffer[i] = 0;
	}
	return buffer;
}

//extend a buffer
const extend = (orig: ArrayLike<number>, length: number, addLength: number, multipleOf: number) => {
	const newSize = length + addLength;

	const buffer = clean((Math.floor(newSize/multipleOf) + 1) * multipleOf);

	buffer.set(orig);

	return buffer;
}

//pad number to fixed length
const pad = (num:number, bytes:number, base = 8) => {
	const str = num.toString(base || 8);

	return "000000000000".substr(str.length + 12 - bytes) + str;
}	

//string to uint8
const stringToUint8 = (input: string, out: Uint8Array, offset = 0) => {
	let i, length = 0;

	out = out || clean(input.length);

	offset = offset || 0;
	for (i = 0, length = input.length; i < length; i += 1) {
		out[offset] = input.charCodeAt(i);
		offset += 1;
	}

	return out;
}

//uint8 to base64
const uint8ToBase64 = (uint8: Uint8Array) => {
	const extraBytes = uint8.length % 3; // if we have 1 byte left, pad 2 bytes
	let i, output = "", temp, length;

	function tripletToBase64 (num: number) {
		return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
	}

	// go through the array every three bytes, we'll deal with trailing stuff later
	for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
		temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
		output += tripletToBase64(temp);
	}

	// this prevents an ERR_INVALID_URL in Chrome (Firefox okay)
	switch (output.length % 4) {
		case 1:
			output += '=';
			break;
		case 2:
			output += '==';
			break;
		default:
			break;
	}

	return output;
}

//base64 to uint8
const base64ToUint8 = (input: string) => {
	const extraBytes = (input.match(/(=*)$/) as any)[1].length;

	const base64 = (input.match(/^([^=]+)/) as any)[1];

	const ret = clean(base64.length * .75 + extraBytes);

	const length = base64.length;

	let	i = 0, temp, offset = 0;


	while (i < length) {
		temp = 0;

		temp |= lookup.indexOf(base64.charAt(i) || 'A') << 18;
		i += 1;
		temp |= lookup.indexOf(base64.charAt(i) || 'A') << 12;
		i += 1;
		temp |= lookup.indexOf(base64.charAt(i) || 'A') << 6;
		i += 1;
		temp |= lookup.indexOf(base64.charAt(i) || 'A');
		i += 1;

		ret[offset] = temp >> 16 & 0xFF;
		offset += 1;
		ret[offset] = temp >> 8 & 0xFF;
		offset += 1;
		ret[offset] = temp & 0xFF;
		offset += 1;
	}

	return ret;
}	

//add file header to the tar
const formatHeader = (data: any, cb:Function) => {
	const buffer = clean(512);
	let	offset = 0;

	headerFormat.forEach(function (value) {
		const str = data[value.field] || "";
		let	i, length;

		for (i = 0, length = str.length; i < length; i += 1) {
			buffer[offset] = str.charCodeAt(i);
			offset += 1;
		}

		offset += value.length - i; // space it out with nulls
	});

	if (typeof cb === 'function') {
		return cb(buffer, offset);
	}
	return buffer;
}

export class Tar  {
	written:number;
	blockSize:number;
	out:Uint8Array;

	constructor(recordsPerBlock = 20){
		this.written = 0;
		this.blockSize = (recordsPerBlock || 20) * recordSize;
		this.out = clean(this.blockSize);		
	}

	append(filepath: string, input: string|Uint8Array, opts: any, callback: Function): Uint8Array {
		let data = Object(), checksum = 0, mode = 0, mtime = 0, uid = 0, gid = 0;

		if (typeof input === 'string') {
			input = stringToUint8(input, clean(input.length));
		} else if (input.constructor !== Uint8Array.prototype.constructor) {
			throw 'Invalid input type. You gave me';
		}

		if (typeof opts === 'function') {
			callback = opts;
			opts = {};
		}

		opts = opts || {};

		mode = opts.mode || parseInt('777', 8) & 0xfff;
		mtime = opts.mtime || Math.floor(+new Date() / 1000);
		uid = opts.uid || 0;
		gid = opts.gid || 0;

		data = {
			fileName: filepath,
			fileMode: pad(mode, 7),
			uid: pad(uid, 7),
			gid: pad(gid, 7),
			fileSize: pad(input.length, 11),
			mtime: pad(mtime, 11),
			checksum: '        ',
			type: '0', // just a file
			ustar: 'ustar  ',
			owner: opts.owner || '',
			group: opts.group || ''
		};

		// calculate the checksum
		checksum = 0;
		Object.keys(data).forEach(function (key) {
			const value = data[key];
			let i, length;

			for (i = 0, length = value.length; i < length; i += 1) {
				checksum += value.charCodeAt(i);
			}
		});

		data.checksum = pad(checksum, 6) + "\u0000 ";

		const headerArr = formatHeader(data, 
			function(buffer:Uint8Array, offset:number){
				return buffer;
			}
		);

		let i, offset, length;

		this.out.set(headerArr, this.written);

		this.written += headerArr.length;

		// If there is not enough space in this.out, we need to expand it to
		// fit the new input.
		if (this.written + input.length > this.out.length) {
			this.out = extend(this.out, this.written, input.length, this.blockSize);
		}

		this.out.set(input, this.written);

		// to the nearest multiple of recordSize
		this.written += input.length + (recordSize - (input.length % recordSize || recordSize));

		// make sure there's at least 2 empty records worth of extra space
		if (this.out.length - this.written < recordSize * 2) {
			this.out = extend(this.out, this.written, recordSize * 2, this.blockSize);
		}

		if (typeof callback === 'function') {
			callback(this.out);
		}

		return this.out;
	}

	clear(): void {
		this.written = 0;
		this.out = clean(this.blockSize);
	}
}


