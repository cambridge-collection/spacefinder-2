Spacefinder
===========

This repository contains a version of the UI for the Cambridge Spacefinder application (https://spacefinder.lib.cam.ac.uk/). It has been built to investigate possibilities for development of the application to make it usable in other higher education contexts.

The major change made to the original application (https://github.com/cambridge-collection/spacefinder/) is the decoupling of the application into User Interface and server-side components. Here, the data for all spaces is served as JSON files rather than using a data endpoint driven by a server-side application.

For more information about the project, [please visit the Spacefinder UI wiki](https://github.com/uol-library/spacefinder-ui/wiki/)

An example of the application when populated with data is available in the `gh-pages` branch of this repository, which is available at https://uol-library.github.io/spacefinder/.

Using this repository
---------------------

This repository can be forked or used as a template in GitHub to create a custom wayfinding application. Key files which require customising with your own information are:

* **_config.yml** - the main Jekyll configuration file
* **_includes/pages/** - directory containing your about page, accessibility statement and privacy statement
* **_includes/favicons.html** - site icon collection
* **_includes/top-bar.html** - site logo (inline SVG or images)

Data configuration
------------------

* Data for spaces is kept in JSON files within the `spaces` directory. 
* Spaces are rendered using functions in the file `_includes/javascript/templates.js`
* Filters for spaces are defined in the file `_data/config.yml`

Spaces **must** have the following pieces of metadata defined for them:

* **id** - a unique numerical identifier for each space. This is used in the filename of the JSON file in the `spaces` directory, i.e. a space with the ID of `2` stors its data in the file `spaces/2.json`
* **title** - name of the space
* **slug** - usually the lower case title with all special characters and spaces removed
* **location** - latitude / longitude values in GeoJSON format.
* **description** - Short description of the space
* **opening_hours** - this is a JSON data structure consisting of weekday names as keys, and properties `open` (boolean), `from` (time in HH:MM format) and `to` (time in HH:MM format).

Other metadata fields can be defined in the JSON data, along with filter information for each space (using keys defined in `_data/config.yml`). This data should then be incorporated somehow into the output of the templates in `_includes/javascript/templates.js`.

Icon Font
---------

Spacefinder uses a font to display different icons which can be customised using https://fontello.com.

The fontello configuration is in the file `assets/font/src/config.json` which you can import into fontello if you want to add and remove icons. Once you have finished customising the font, download the package from fontello and replace the content of your `assets/font/src` folder with it. The package contains the font (in five formats) and a CSS file `assets/font/src/css/spacefinder.css` which can be used to replace the icon CSS file in `_sass/spacefinder.scss`. The only change made to this file is applying the global icon style to the `::before` **and** `::after` pseudo-elements which allows for the inclusion of two icons together in parts of the UI.

Local installation
------------------

### Requirements

The application requires **Ruby 2.7.4** and **Jekyll 3.9.0** you can test what version you have installed locally using the following commands:

    ruby -version
    bundle exec jekyll -version

#### Installing a Ruby version manager

I'd recommend installing a version manager for working with Ruby, you can find instructions on how to install
rbenv for managing different versions of Ruby on your local system by following the instructions below:

Update your package list and install the dependencies required to install Ruby:

    sudo apt update
    sudo apt install git curl libssl-dev libreadline-dev zlib1g-dev autoconf bison build-essential libyaml-dev libreadline-dev libncurses5-dev libffi-dev libgdbm-dev

Now install rbenv itself. Use curl to fetch the install script from Github and pipe it directly to bash to run the installer:

    curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash

Next, add ~/.rbenv/bin to your $PATH so you can use the rbenv command line utility. Do this by altering your ~/.bashrc file so that it affects future login sessions:

    echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc

Then, add the command eval "$(rbenv init -)" to your ~/.bashrc file so rbenv loads automatically:

    echo 'eval "$(rbenv init -)"' >> ~/.bashrc

Next, apply the changes you made to your ~/.bashrc file to your current shell session:

    source ~/.bashrc

Now you should have both rbenv and ruby-build installed.

#### Installing Ruby 2.7.4 (on Ubuntu 22.04)
There are some issues with installing this version of Ruby on Ubuntu 22.04 as it
requires OpenSSL 1.1.1 which is not installed by default, so you will need to compile and
install your own custom version of OpenSSL 1.1.1 for it to use.

Instructions on doing this can be found here:
https://deanpcmad.com/2022/installing-older-ruby-versions-on-ubuntu-22-04/

Once you have the the required version of openssl installed you can install the version of ruby that
we will need by running (substitute in the openssl location if different):

    RUBY_CONFIGURE_OPTS=--with-openssl-dir=$HOME/.openssl/openssl-1.1.1g rbenv install 2.7.4

You can then set the local project version of ruby by navigating to the spacefinder directory and running

    rbenv local 2.7.4

and confirm that the version is correct with

    ruby -v

#### Compiling and running the local version

You can run the following commands to bundle, compile and run a local version of the spacefinder application.

    export GEM_HOME="$HOME/.gem"
    bundle install
    bundle exec jekyll serve

This should start the application on the URL:

[http://localhost:4000/spacefinder/](http://localhost:4000/spacefinder/)

Changelog
---------

### 0.9 (10/1/2023)

* Initial release of code based on https://github.com/uol-library/spacefinder-ui

