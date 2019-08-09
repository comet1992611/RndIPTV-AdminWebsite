[![Build Status](https://travis-ci.org/hattan/ectoken-nodejs.svg?branch=master)](https://travis-ci.org/hattan/ectoken-nodejs)

![Verizon Digital Media Services](https://images.verizondigitalmedia.com/2016/03/vdms-30.png)


# Token Generator for Edgecast Token-Based Authentication

Token-Based Authentication safeguards against hotlinking by adding a token requirement to requests for content secured by it. This token, which must be defined in the request URL's query string, defines the criteria that must be met before the requested content may be served via the CDN. This repository contains the following token generation resources:
- [Linux binaries and Windows executable](https://github.com/VerizonDigital/ectoken/releases/latest)

node.js Token Generator for EdgeCast Token-Based Authentication

## Methods
* **encrypt**(key, params, verbose)
* **decrypt**(key, token, verbose)

## Example
```javascript
const ectoken = require('ectoken').V3;

// encrypt
const token = ectoken.encrypt('keyvalue', 'ec_expire=1257642471&ec_clientip=11.22.33.1');

// decrypt
const params = entoken.decrypt('keyvalue', token);
```



## Contributing

Contributions are welcome! Please review our [contribution guidelines](CONTRIBUTING.md).

## More Information

Please refer to the CDN Help Center, which is available from within the MCC, for more information (e.g., parameter names and usage).

## License

[View legal and licensing information.](LICENSE.txt)
