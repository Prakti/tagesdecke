# Tagesdecke - a thin CouchDB access library

[![Build Status](https://travis-ci.org/Prakti/tagesdecke.svg?branch=master)](https://travis-ci.org/Prakti/tagesdecke)
[![Coverage Status](https://img.shields.io/coveralls/Prakti/tagesdecke.svg)](https://coveralls.io/r/Prakti/tagesdecke?branch=master)
[![Code Climate](https://codeclimate.com/github/Prakti/tagesdecke/badges/gpa.svg)](https://codeclimate.com/github/Prakti/tagesdecke)
[![Dependency Status](https://david-dm.org/prakti/tagesdecke.svg)](https://david-dm.org/prakti/tagesdecke)
[![devDependency Status](https://david-dm.org/prakti/tagesdecke/dev-status.svg)](https://david-dm.org/prakti/tagesdecke#info=devDependencies)

This library is meant to be a thin access driver for CouchDB, easing most of
the low-level HTTP handling via convenience functions.

The term 'tagesdecke' is the german term for coverlet meant to be lying on a
couch.

The library is currently considered beta stage, minor API changes are going
to occur. Relax ever so slightly.

Documentation can be found [here](http://prakti.github.io/tagesdecke/).

## Example usage in Node.js

First import all the dependencies for usage:
```javascript
var request = require('request');
var tagesdecke = require('tagesdecke');
var Promise = require('bluebird');
```

Now configure the connection options. If you do not want to play on CouchDB in
Admin-Party mode, provide a user and a passwd. Afterwards we can open the
connection.

```javascript
var options = {
  user: 'user',
  passwd: 'passwd',
  useCookie: true 
};

var connection = new Connection('http://localhost:5984', request, options);
```

Without Cookies, tagesdecke
will use the basic HTTP Auth mode and send the user and password in each
request. If you want to use cookies just set the `useCookie` flag and
tagesdecke will try to keep the session alive, even when CouchDB deliberately
kills it after a timeout. (See the CouchDB docs)

Theoretically you could now directly operate on the connection but you would
have to specify the database in the url of the requests. Since we want a bit
more convenience we will now care for opening a database. Since we want to
ensure that the database exists we will make HTTP calls to the CouchDB host
which will be represented by promises. Let's write a convenience function for
lazily ensuer that the database is always open:

```javascript
var dbname = 'dbname';
var database = null;

// Write a convenience method for cached access to a database.
function open () {
  if (database) {
    return new Promise(function (resolve, reject) {
      resolve(database);
    });
  } else {
    return connection.openDB(dbname).then(function (_database) {
      database = _database;
      return database;
    });
  }
}
```

Using that convenience method for opening the database we can now write a
function for retrieving a document by ID from the database:

```javascript
// Function for simple access to a document.
function getDocument(id) {
  return open().get(id).then(function (result) {
    return result.body;
  });
}
```

Et voila, now you can write your own abstraction layer on top of these two
objects while still accessing all the gory details of the CouchDB HTTP Api if
necessary. Enjoy.
