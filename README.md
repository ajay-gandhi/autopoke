Autopoke
========

An automatic Facebook poker.

This Node.js webapp hosts an interface for users to enter their Facebook email
address and password, and the name of someone to automatically poke.

The server will then periodically check if that person has been poked (via
headless browser). If they haven't, the server pokes them for the user.

## Setup

Clone the git repo, the `cd` into it:

    $ git clone https://github.com/ajay-gandhi/autopoke.git
    $ cd autopoke

Run `npm install` to install any Node.js packages that the server uses:

    $ npm install

Create a file in the root directory called `captcha.json`, and store your
secret reCAPTCHA key there:

```json
{
  key: 'your-secret-key'
}
```

Then, in `html/index.html`, update this line of HTML to contain your reCAPTCHA
public key (in `data-sitekey`):

```html
<div class="g-recaptcha" data-sitekey="6LeqUwsTAAAAAPVccUcS9OaxhLIpcdYPtr50Im3t"></div><br />
```

## Usage

You're ready to go! Run `node app.js` to start the server.

    $ node app.js

Note that stopping the server will end all autopokes, since nothing is stored
permanently. All login information and names are stored in JavaScript variables
on the server.
