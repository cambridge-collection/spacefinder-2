/**
 * Tool used to process Cambridge data into JSON files in spaces directory
 *
 * Original author: Peter Edwards
 */
const fs = require('fs');
const path = require('path');
const data = fs.readFileSync( path.resolve( __dirname, '../../_data/cambridge/spaces-28-02-2023.json' ), { encoding: 'utf8' } );
const imageDirPath = path.join('/', 'assets', 'photos');
const fileJSON = JSON.parse( data );
var spaceID = 1;
const floorMap = {
    '1st floor': 'First floor',
    'First': 'First floor',
    'Fourth': 'Fourth floor',
    'Lower Ground Floor': 'Lower ground floor',
    'Ground Floor': 'Ground floor',
    '1st Floor': 'First floor',
    '2nd Floor': 'Second floor',
    'Third': 'Third floor',
    'Second': 'Second floor',
    ' ': '',
    'Lower Ground': 'Lower ground floor',
    '1': 'First floor',
    'Ground': 'Ground floor',
    '2': 'Second floor',
    'ground floor': 'Ground floor',
    '2nd and 3rd floors': 'Second and third floors',
    'First floor.': 'First floor',
    '1st': 'First floor',
    '2nd': 'Second floor',
    '3rd': 'Third floor',
    'Ground floor entrance': 'Ground floor',
    'First, Second and Third': 'First, second and third floors',
    'First ': 'First floor',
    '5th': 'Fifth floor',
    '3': 'Third floor',
    '1st Floor of the Baker Building': 'First floor'
};
const workStyle = [
    "close",
    "friends",
    "group",
    "in_a_library",
    "private",
]

fileJSON.results.forEach( space => {
    const newSpace = {
        access: space.access,
        address: space.address,
        atmosphere: get_atmosphere( space.atmosphere ),
        building: get_building( space.library ),
        description: space.description,
        disabled_access: get_disabled_access( space.disabled_access ),
        email_address: space.email_address,
        facebook_url: get_facebook_url( space.facebook_url ),
        facilities: get_facilities( space.facilities ),
        floor: get_floor( space.floor ),
        id: spaceID,
        image: get_image_path( space.images ),
        imagealt: space.name,
        lat: parseFloat( space.lat ),
        lng: parseFloat ( space.lng ),
        location: get_geojson( space.lng, space.lat ),
        noise: space.noise,
        opening_hours: get_opening_hours( space.term_time_hours ),
        out_of_term_hours: get_opening_hours( space.out_of_term_hours ), // retained for future usage
        phone_number: space.phone_number,
        phone_text: 'Phone the space',
        published: true,
        restricted: space.restricted,
        restriction: space.restriction,
        slug: string_to_slug( space.name ),
        space_type: space.space_type,
        tags: space.admin_tag_list,
        title: space.name,
        term_time_hours: get_opening_hours( space.term_time_hours ), // retained for future usage
        twitter_screen_name: space.twitter_screen_name,
        url: space.url,
        url_text: 'Visit the website',
        work: get_work_style( workStyle, space),
    };

    fs.writeFile( path.resolve( __dirname, '../../spaces/'+spaceID+'.json' ), JSON.stringify( newSpace, null, '    ' ), err => {
        if (err) {
            console.error( err );
        }
    });

    console.log("ID # old: " + space.id + "; new: " + spaceID);
    spaceID++;
});

console.log("Converted " + (spaceID - 1)  + " spaces");


// Helper functions

function get_atmosphere ( atmos_list ) {
    let clean_atmos = [];
    atmos_list.forEach( atm => { clean_atmos.push( atm.replace('atmosphere_', '') ); })
    return clean_atmos;
}

function get_building ( library ) {
    return library == null ? '': library;
}

function get_disabled_access ( disabled_access ) {
    return disabled_access == null ? false : disabled_access;
}

function get_facebook_url ( fb_url ) {
    return fb_url === '' ? '': new URL( fb_url, 'https://www.facebook.com/' );
}

function get_facilities ( fac_list ) {
    let clean_fac = [];
    fac_list.forEach( fac => { clean_fac.push( fac.replace('facility_', '') ); })
    return clean_fac;
}

function get_floor ( floor ) {
    return floorMap.hasOwnProperty( floor ) === true ? floorMap[floor] : floor;
}

function get_image_path( images ) {
    let imagePath;
    if ( images.length === 0 ) { // No images
        imagePath = '';
    }
    else {
        let image = images[0] // First image on list
        let filePath = path.basename( image.split('.')[0] ); // Remove file ext and params
        let dirPath = path.dirname( image )
        let preDirs = dirPath.split('/')
        let prefix = preDirs[5] + "-" + preDirs[6] + "-" + preDirs[7] + "_"
        imagePath = path.format({
            dir: imageDirPath,
            name: prefix + filePath,
            ext: '.jpg',
        });
    }

    return imagePath;
}

function get_geojson ( lng, lat ) {
    let geoJSON = {
        type: 'Point',
        coordinates: [ parseFloat( lng ), parseFloat ( lat )]
    };
    return JSON.stringify(geoJSON);
}

function get_opening_hours ( opening_hours ) {
    let new_opening_hours = {};
    for ( let day in opening_hours ) {
        new_opening_hours[day] = {
            open: opening_hours[day].open,
            from: opening_hours[day].from,
            to: opening_hours[day].to
        }
        if ( new_opening_hours[day].to === '00:00' ) {
            new_opening_hours[day].to = '24:00';
        }
    }
    return new_opening_hours;

}

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

function get_work_style ( work_styles, space ) {
    let work_style_list = [];
    for ( let i in work_styles ) {
        let style = work_styles[i];
        if ( space['work_'+style] === true ) {
            work_style_list.push( style )
        }
    }
    return work_style_list;
}
