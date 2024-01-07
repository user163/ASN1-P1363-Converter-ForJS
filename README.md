JavaScript for converting ECDSA signatures in ASN.1/DER format to P1363 format and vice versa. Supports curves of any length. Uses [node-forge](https://github.com/digitalbazaar/forge) for encoding with and decoding from ASN.1/DER.

The tests (for P-256 and P-521) also illustrate the use of the conversion functions.

<h3>Note on the ASN.1/DER format:</h3>
r and s have a value that is smaller than n, where n is the order of the generator point. This means that the number of bytes of n is equal to the maximum number of bytes of r and s, which may also be smaller. Illustrated using the example of P-256 (number of bytes of n: 32):

```none
r: 0x9f7492eb1617fb160d0626db32133b43abf34029b9346c1dde38d99eb8815401   32 bytes
s: 0xbf70252ef4a1ba94cd4c58817732f2e3c83233fa8e1a645338e37c3d4c1a7927   32 bytes

r: 0xa73a5d2b36002711e8c706369131376174039fe6173d778eee0b9f8569df31     31 bytes
s: 0x9da9780952e279c809bb798193d8e69260554d9f7c14eda614cd29229200f177   32 bytes

r: 0x7e509a3e6ac6ca5337b84109e43180dc24cdf9bbec9a3f607eaf630813160a     31 bytes
s: 0x4a0160420abace1e29e92f43a7103ff3d752546ad78665c804cd593e4ad6fc83   32 bytes

r: 0x4c1f45c4f3a891bb5965f803c352713c0ac33c08a4f98e8f235b6fd78c38       30 bytes
s: 0xa786a733101df42c289294a0975c07499893c1cc8241feba2f01f2e3c03415b1   32 bytes
```

(Note: The different lengths are illustrated for r, but also apply to s)

The ASN.1/DER format contains r and s as the minimum sized signed big endian byte sequence (see e.g. https://crypto.stackexchange.com/a/57734). This results in the ASN.1/DER format having a varying size, as both the number of bytes of r and s vary.  
In addition, the data is represented as signed, i.e. if the first byte is greater than 0x7f, it is preceded by 0x00. The above byte sequences are therefore included in a signature with ASN.1/DER format as follows:

```none
r: 0x009f7492eb1617fb160d0626db32133b43abf34029b9346c1dde38d99eb8815401   33 bytes
s: 0x00bf70252ef4a1ba94cd4c58817732f2e3c83233fa8e1a645338e37c3d4c1a7927   33 bytes

r: 0x00a73a5d2b36002711e8c706369131376174039fe6173d778eee0b9f8569df31     32 bytes
s: 0x009da9780952e279c809bb798193d8e69260554d9f7c14eda614cd29229200f177   33 bytes

r: 0x7e509a3e6ac6ca5337b84109e43180dc24cdf9bbec9a3f607eaf630813160a       31 bytes
s: 0x4a0160420abace1e29e92f43a7103ff3d752546ad78665c804cd593e4ad6fc83     32 bytes

r: 0x4c1f45c4f3a891bb5965f803c352713c0ac33c08a4f98e8f235b6fd78c38         30 bytes
s: 0x00a786a733101df42c289294a0975c07499893c1cc8241feba2f01f2e3c03415b1   33 bytes
```

The function `toMinSizedSignedBE()` formats r and s according to these rules; the formatted r and s are then ASN.1/DER encoded.

The above examples in ASN.1/DER format (the gaps are only there for the sake of clarity) are:

```none
3046 0221 009f7492eb1617fb160d0626db32133b43abf34029b9346c1dde38d99eb8815401 0221 00bf70252ef4a1ba94cd4c58817732f2e3c83233fa8e1a645338e37c3d4c1a7927
3045 0220 00a73a5d2b36002711e8c706369131376174039fe6173d778eee0b9f8569df31   0221 009da9780952e279c809bb798193d8e69260554d9f7c14eda614cd29229200f177 
3043 021f 7e509a3e6ac6ca5337b84109e43180dc24cdf9bbec9a3f607eaf630813160a     0220 4a0160420abace1e29e92f43a7103ff3d752546ad78665c804cd593e4ad6fc83 
3043 021e 4c1f45c4f3a891bb5965f803c352713c0ac33c08a4f98e8f235b6fd78c38       0221 00a786a733101df42c289294a0975c07499893c1cc8241feba2f01f2e3c03415b1
```

<h3>Note on the P1363 format:</h3>
In the P1363 format, the number of bytes of r and s corresponds to the number of bytes of n. Values that are too short are padded from the left with 0x00, leading 0x00 for values that are too large (due to the byte sign) are truncated. The r and s formatted in this way are usually concatenated.  

The function `toP1363Size()` formats r and s according to these rules. The number of bytes of n must be specified. 

The above examples in P1363 format (the gaps are only there for the sake of clarity) are:

```none
9f7492eb1617fb160d0626db32133b43abf34029b9346c1dde38d99eb8815401 bf70252ef4a1ba94cd4c58817732f2e3c83233fa8e1a645338e37c3d4c1a7927
00a73a5d2b36002711e8c706369131376174039fe6173d778eee0b9f8569df31 9da9780952e279c809bb798193d8e69260554d9f7c14eda614cd29229200f177
007e509a3e6ac6ca5337b84109e43180dc24cdf9bbec9a3f607eaf630813160a 4a0160420abace1e29e92f43a7103ff3d752546ad78665c804cd593e4ad6fc83
00004c1f45c4f3a891bb5965f803c352713c0ac33c08a4f98e8f235b6fd78c38 a786a733101df42c289294a0975c07499893c1cc8241feba2f01f2e3c03415b1
```

<h3>Notes regarding different curves:</h3>
As data types (e.g. INTEGER) are encoded in the ASN.1/DER format and this encoding depends on the value (e.g. for INTEGER greater than 127 or less), different byte sequences may occur for different curves (e.g. P-256 and P-521) in addition to the different r and s values (see e.g. https://security.stackexchange.com/a/164906).
