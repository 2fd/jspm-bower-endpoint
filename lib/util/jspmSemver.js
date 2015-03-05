var semver = require('semver') ;

var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*)(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?)?)?)?$/i;
var getVersion = function(version) {
  return version[1] + '.' + version[2] + '.' + version[3] + (version[4] ? '-' + version[4] : '');
}

module.exports.parse = function(version){

    if( semver.valid(version) )
        return version;

    /**
     * Convert versions
     */

    var range;

    if (version === '' || version === 'latest' || version === '*')
        version = '*';

    // if we have a semver or fuzzy range, just keep as-is
    else if (version.indexOf(/[ <>=]/) != -1 || !version.substr(1).match(semverRegEx) || !version.substr(0, 1).match(/[\^\~]/))
        var range = semver.validRange(version);

      if (range == '*')
        version = '*';

      else if (range) {
        // if it has OR semantics, we only support the last range
        if (range.indexOf('||') != -1)
          range = range.split('||').pop();

        var rangeParts = range.split(' ');

        // convert AND statements into a single lower bound and upper bound
        // enforcing the lower bound as inclusive and the upper bound as exclusive
        var lowerBound, upperBound, lEq, uEq;
        for (var i = 0; i < rangeParts.length; i++) {
          var part = rangeParts[i];
          var a = part.charAt(0);
          var b = part.charAt(1);

          // get the version
          var v = part;
          if (b == '=')
            v = part.substr(2);
          else if (a == '>' || a == '<' || a == '=')
            v = part.substr(1);

          // and the operator
          var gt = a == '>';
          var lt = a == '<';

          if (gt) {
            // take the highest lower bound
            if (!lowerBound || semver.gt(lowerBound, v)) {
              lowerBound = v;
              lEq = b == '=';
            }
          }
          else if (lt) {
            // take the lowest upper bound
            if (!upperBound || semver.lt(upperBound, v)) {
              upperBound = v;
              uEq = b == '=';
            }
          }
          else {
            // equality
            lowerBound = upperBound = part.substr(1);
            lEq = uEq = true;
            break;
          }
        }

        // for some reason semver adds "-0" when not appropriate
        if (lowerBound && lowerBound.substr(lowerBound.length - 2, 2) == '-0')
          lowerBound = lowerBound.substr(0, lowerBound.length - 2);
        if (upperBound && upperBound.substr(upperBound.length - 2, 2) == '-0')
          upperBound = upperBound.substr(0, upperBound.length - 2);

        var lowerSemver, upperSemver;

        if (lowerBound) {
          lowerSemver = lowerBound.match(semverRegEx);
          lowerSemver[1] = parseInt(lowerSemver[1], 10);
          lowerSemver[2] = parseInt(lowerSemver[2], 10);
          lowerSemver[3] = parseInt(lowerSemver[3], 10);
          if (!lEq) {
            if (!lowerSemver[4])
              lowerSemver[4] = '0';
            // NB support incrementing existing preleases
          }
        }

        if (upperBound) {
          upperSemver = upperBound.match(semverRegEx);
          upperSemver[1] = parseInt(upperSemver[1], 10);
          upperSemver[2] = parseInt(upperSemver[2], 10);
          upperSemver[3] = parseInt(upperSemver[3], 10);
        }

        if (!upperBound && !lowerBound) {
          version = '';
        }

        // if not upperBound, then just treat as a wildcard
        else if (!upperBound) {
          version = '*';
        }

        // if no lowerBound, use the upperBound directly, with sensible decrementing if necessary
        else if (!lowerBound) {

          if (uEq) {
            version = upperBound;
          }

          else {
            if (!upperSemver[4]) {
              if (upperSemver[3] > 0) {
                upperSemver[3]--;
              }
              else if (upperSemver[2] > 0) {
                upperSemver[2]--;
                upperSemver[3] = 0;
              }
              else if (upperSemver[1] > 0) {
                upperSemver[1]--;
                upperSemver[2] = 0;
                upperSemver[3] = 0;
              }
            }
            else {
              upperSemver[4] = undefined;
            }
            version = getVersion(upperSemver);
          }
        }

        else {
          // if upper bound is inclusive, use it
          if (uEq)
            version = upperBound;

          // if upper bound is exact major
          else if (upperSemver[2] == 0 && upperSemver[3] == 0 && !upperSemver[4]) {

            // if previous major is 0
            if (upperSemver[1] - 1 == 0) {
              version = '0';
            }
            else {
              // if lower bound is major below, we are semver compatible
              if (lowerSemver[1] == upperSemver[1] - 1)
                version = '^' + getVersion(lowerSemver);
              // otherwise we are semver compatible with the previous exact major
              else
                version = '^' + (upperSemver[1] - 1);
            }
          }
          // if upper bound is exact minor
          else if (upperSemver[3] == 0 && !upperSemver[4]) {
            // if lower bound is minor below, we are fuzzy compatible
            if (lowerSemver[2] == upperSemver[2] - 1)
              version = '~' + getVersion(lowerSemver);
            // otherwise we are fuzzy compatible with previous
            else
              version = '~' + upperSemver[1] + '.' + (upperSemver[2] - 1) + '.0';
          }
          // if upper bound is exact version -> use exact
          else
            version = null
        }
      }


    return version;

};