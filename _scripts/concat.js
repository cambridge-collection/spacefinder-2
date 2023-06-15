/**
 * This script takes all the files within the spaces directory and compiles a master data file
 * in the root of the repository called spaces.json
 */
const fs = require('fs');
const path = require('path');
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } )
    .filter(file => {
        return path.extname(file).toLowerCase() === '.json';
    });
const allSpaces = [];
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let data = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ), { encoding: 'utf8' } );
        let jsondata = JSON.parse( data );
        if ( jsondata.published ) {
            jsondata.slug = string_to_slug(jsondata.title);
            let geodata = JSON.parse( jsondata.location );
            if ( geodata && geodata.coordinates && geodata.coordinates.length === 2 ) {
                jsondata.lat = geodata.coordinates[1];
                jsondata.lng = geodata.coordinates[0];
            } else {
                jsondata.lat = '';
                jsondata.lng = '';
            }
            allSpaces.push( jsondata );
        }
    }
});
fs.writeFileSync( path.resolve( __dirname, '../spaces.json' ), JSON.stringify( allSpaces ) );

function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to = "aaaaeeeeiiiioooouuuunc------";
    for (let i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}