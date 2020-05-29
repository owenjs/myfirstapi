var express = require('express');
var router = express.Router();

const Hubspot = require('hubspot');

const getFullName = (contact) => {
  var firstname = contact.properties.firstname.value || '';
  var lastname = contact.properties.lastname.value || '';
  return `${firstname} ${lastname}`;
};

const prepareContacts = (contacts) => {
  var contactsPrepared = [];
  for (var i = 0; i < contacts.length; i++) {
    var contact = contacts[i];
    contactsPrepared.push({
      vid: contact.vid,
      name: getFullName(contact),
      companyName: contact.properties.company.value
    });
  }
  return contactsPrepared;
}

router.get('/', async (req, res, next) => {
  var hubspot = new Hubspot({apiKey: process.env.HUBSPOT_API_KEY})

  contactResults = await hubspot.contacts.get();

  res.send(prepareContacts(contactResults.contacts));
});

module.exports = router;