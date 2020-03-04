# Developing with SAML login

The example configuration file contains this SAML login provider:

```json
{
    "type": "saml",
    "id": "samling",
    "name": "Samling",
    "metadata": { "url": "https://capriza.github.io/samling/public/metadata.xml" }
}
```

This is a client side testing service for working with SAML. It mimics a SAML IDP in the browser and allows you to log in using any user id. 

If you use the above configuration, and try to log in using Samling, you will be redirected to `https://capriza.github.io/samling/samling.html` as the IDP login page. On this page you need to provide a value for the *Name Identifier* field. Here you fill in the external ID of your user. Click on *Next* and then on *Post Response!* to submit the SAML response back to Atelier. You're now logged in with the ID you provided.