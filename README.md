# OneDrive Sucker

Suck a directory out of a OneDrive link without having to click like a peasant. Optionally compare its content with previous version and send alerts if there are changes.

**NOTE**: I needed this because my former accountant had a stupid system where they gave me a link to a one drive folder and would occasionally put stuff there, which I was supposed to manually check and download. Notice the word "former". Since I am no longer having to check that link, I am not maintaining this tool any longer. 

### Setup

```bash
npm install
```

Create `.env` file in the root directory with your options. See [app_settings.js](./src/app_settings.js) for hint of what you can configure.

### Usage

```bash
src/bin/one-drive-sucker
```

Then follow help instructions.

### License

MIT
