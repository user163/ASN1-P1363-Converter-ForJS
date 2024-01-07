var asn1 = forge.asn1;

function p1363ToAsn1Der(rHex, sHex){
	rHex = toMinSizedSignedBE(rHex)
	sHex = toMinSizedSignedBE(sHex)
	var asn1Signature =
		asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
			asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false, forge.util.hexToBytes(rHex)),
			asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false, forge.util.hexToBytes(sHex)),
		])
		return asn1.toDer(asn1Signature).toHex()
}

function asn1DerToP1363(asn1DerSignatureHex, sizeInBytes){
	var asn1DerSignature = forge.util.hexToBytes(asn1DerSignatureHex)   
	var asn1Signature = asn1.fromDer(asn1DerSignature)
	var signatureValidator = 
		{name: 'Signature', tagClass: asn1.Class.UNIVERSAL, type: asn1.Type.SEQUENCE, constructed: true, captureAsn1: 'signature', value: [
			{name: 'Signature.RPart', tagClass: asn1.Class.UNIVERSAL, type: asn1.Type.INTEGER, constructed: false, captureAsn1: 'rpart'},
			{name: 'Signature.SPart', tagClass: asn1.Class.UNIVERSAL, type: asn1.Type.INTEGER, constructed: false, captureAsn1: 'spart'}
		]}
	var capture = {}, errors = []
		if(!asn1.validate(asn1Signature, signatureValidator, capture, errors)) {
			throw 'ASN.1 object is not an asn1Signature.';
		}
	return {r: toP1363Size(forge.util.bytesToHex(capture.rpart.value), sizeInBytes), s: toP1363Size(forge.util.bytesToHex(capture.spart.value), sizeInBytes)}
}

// see https://crypto.stackexchange.com/a/57734
function toMinSizedSignedBE(hex) {
	if (hex.length % 2 != 0) hex = '0' + hex                                     // ensure an even number of hex digits: 0x3af -> 0x03af
	hex = hex.replace(/^(0{2})+/, '')                                            // ensure a min sized unsigned big endian: 0x000085af -> 0x85af
	if (hex.length > 1 && parseInt(hex.substr(0,2), 16) > 127) hex = '00' + hex  // ensure a min sized signed big endian: 0x85af -> 0x0085af
	return hex
}
function toP1363Size(hex, sizeInBytes){
    if (hex.length > 2 * sizeInBytes) hex = hex.substr(hex.length - 2 * sizeInBytes, 2 * sizeInBytes) // truncate if size is larger than sizeInBytes
	else if (hex.length < 2 * sizeInBytes) hex = hex.padStart(2 * sizeInBytes, '0')               // pad with leading 0x00 if size is smaller than sizeInBytes 
	return hex
}

