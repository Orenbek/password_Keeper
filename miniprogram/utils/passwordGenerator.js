
/*
 * password-generator
 * Copyright(c) 2011-2019 Bermi Ferrer <bermi@bermilabs.com>
 * MIT Licensed
 */
(function () {

  var consonant, password, vowel, rand;
  vowel = /[aeiou]$/i;
  consonant = /[bcdfghjklmnpqrstvwxyz]$/i;

  password = function (length, memorable, pattern, prefix) {
    var char = "", n, i, validChars = [];
    if (length === null || typeof(length) === "undefined") {
      length = 10;
    }
    if (memorable === null || typeof(memorable) === "undefined") {
      memorable = true;
    }
    if (pattern === null || typeof(pattern) === "undefined") {
      pattern = /\w/;
    }
    if (prefix === null || typeof(prefix) === "undefined") {
      prefix = '';
    }

    // Non memorable passwords will pick characters from a pre-generated
    // list of characters
    if (!memorable) {
      for (i = 33; i <= 126; i += 1) {
        char = String.fromCharCode(i);
        if (char.match(pattern)) {
          validChars.push(char);
        }
      }

      if (!validChars.length) {
        throw new Error("Could not find characters that match the " +
          "password pattern " + pattern + ". Patterns must match individual " +
          "characters, not the password as a whole.");
      }
    }


    while (prefix.length < length) {
      if (memorable) {
        if (prefix.match(consonant)) {
          pattern = vowel;
        } else {
          pattern = consonant;
        }
        n = rand(33, 126);
        char = String.fromCharCode(n);
      } else {
        char = validChars[rand(0, validChars.length)];
      }

      if (memorable) {
        char = char.toLowerCase();
      }
      if (char.match(pattern)) {
        prefix = "" + prefix + char;
      }
    }
    return prefix;
  };


  rand = function (min, max) {
    const range = max-min;
    return Math.floor(Math.random()*range+min);;
  };


  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = password;
    }
  }

}(this));
