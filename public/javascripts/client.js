$(function () {

	// INITIALIZING
    // Initialize Bootstrap tooltips.
    $('body').tooltip({
        selector: '[data-toggle=tooltip]'
    });

    // RENDERING
	// Process Handlebars templates.
    var renderElements = function (template, data) {
		var templateSource = template.html();
		var renderTemplate = Handlebars.compile(templateSource);
		var rendered = renderTemplate(data);
		$('.maincontent').append(rendered);
	};
	
    // Display a hidden element.
	var showElements = function (displayElement) {
		displayElement.addClass('show');
	};

    // Create a High Chart.
    var createChart = function (container, results) {
        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: 'Helvetica Neue',
                    fontWeight: '200'
                }
            }
        });
        
        container.highcharts({
            chart: {
                type: 'waterfall'
            },

            credits: {
                enabled: false
            },
            
            exporting: {
                enabled: false
            },

            title: {
                text: ''
            },

            xAxis: {
                type: 'category'
            },

            yAxis: {
                gridLineWidth: 0,
                title: {
                    text: ''
                },
                labels: {
                    enabled: false
                }
            },

            legend: {
                enabled: false
            },

            tooltip: {
                enabled: false
            },

            plotOptions: {
                series: {
                    borderWidth: 0
                }
            },

            series: [{
                color: '#B2E0C2',
                data: [{
                    name: 'beginning equity',
                    y: results.begEquity,
                    color: '#cecece'
                }, 
                {
                    name: 'ebitda growth',
                    y: results.ebitdaSourceReturns
                }, 
                {
                    name: 'fcf generation',
                    y: results.freeCashFlow
                }, 
                {
                    name: 'multiple expansion',
                    y: results.multipleSourceReturns
                }, 
                {
                    name: 'ending equity',
                    isSum: true,
                    color: '#cecece'
                }],
                
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y, 0, ',');
                    },
                    style: {
                        color: '#000000',
                        fontWeight: '400'
                    }
                },
                pointPadding: 0
            }]
        });
    };
    
    // EVENTS
    // On click of the 'register' text, render a username / password form via Handlebars.
    $('.introcontent').on('click', '#register', function (e) {
        $('.maincontent').empty();
        if ($('#register-container').length === 0) {
            renderElements($('#register-template'));
            setTimeout( function () {
                showElements($('#register-container'));
            }, 0 );
        }
    });

    // On click of the registration form 'submit' button, send username and password to the server for processing.
    $('.maincontent').on('submit', '#register-form', function (e) {
        e.preventDefault();
        $.post ('/register', $('#register-form').serialize(), function (results) {
            $('.maincontent').empty();
            if (typeof results === 'string') {
                $('.maincontent').append('<p class="instructions">' + results + '</p>');
            }
            else {
                renderElements($('#message-template'), results);
                setTimeout( function () {
                    showElements($('#message-container'));
                }, 0 );
            }
        });
    });

    // On click of the 'login' text, render a username / password form via Handlebars.
    $('.introcontent').on('click', '#login', function (e) {
        $('.maincontent').empty();
        if ($('#login-container').length === 0) {
            renderElements($('#login-template'));
            setTimeout( function () {
                showElements($('#login-container'));
            }, 0 );
        }
    });

    // On click of the login submit button, send username and password to the server for processing.
    $('.maincontent').on('submit', '#login-form', function (e) {
        e.preventDefault();
        $.post ('/login', $('#login-form').serialize(), function (results) {
            $('.maincontent').empty();
            if (typeof results === 'string') {
                $('.maincontent').append('<p class="instructions">'+ results + '</p>');
            }
            else {
                renderElements($('#message-template'), results);
                setTimeout( function () {
                    showElements($('#message-container'));
                }, 0 );
            }
        });
    });    

    // On click of the 'new company' text, render a new company input form via Handlebars.
    $('.introcontent').on('click', '#newCo', function (e) {
        $('.maincontent').empty();
        $.get ('/checkuser', function (results) {
            // Ensure user is logged in and form does not already exist.
            if ( results && $('#add-company-container').length === 0 ) { 
                renderElements($('#newCo-template'));
                setTimeout( function () {
                    showElements($('#add-company-container'));
                    $('#first-input').focus(); 
                }, 0 );
            }
            else {
                $('.maincontent').append('<p class="instructions">Please login or register before you create a company.')
            }
        });
    });     
    
    // On click of the submit form, send the form data to the server, then render the valuation results (received from server).
    $('.maincontent').on('submit', '#add-company-form', function (e) {
        e.preventDefault();
        $.post ('/newcompany', $('#add-company-form').serialize(), function (results) {
            // Receive calculations from the server.  If user input was inaccurate, return an error message, else, render the calculation results.
            $('.maincontent').empty();
            // Server will send back a string "error" if the form was not fully completed or server will send an object with a "message" key if the data was out of range.
            if ( results === "error" || "message" in results ) {
                $('.maincontent').append('<p class="instructions">Invalid input, please try again.</p>');
            }
            else {
                renderElements($('#results-template'), results);
                createChart($('#chart-container'), results);
            }
        });
    });

    
    // On click of 'existing company' text, get the available companies from server, render in a form.
    $('.introcontent').on('click', '#existingCo', function (e) {
        $('.maincontent').empty();
        // Make an ajax call to get list of companies
        $.get ('/existingcompany', null, function (results) {
            //Render company form here.
            if ($('#existing-company-container').length === 0) {
                renderElements($('#existingList-template'), {results: results});
                setTimeout( function () {
                    showElements($('#existing-company-container'));
                }, 0);
            }
        });
    });

    // On click of particular existing company, send value of company clicked to the server.
    $('.maincontent').on('click', '.clickable', function (e) {
        var queryItem = $(this).attr('name');
        $.get ('/findexisting', {queryItem: queryItem}, function (results) {
            // Render chart and valuation with results
            $('.maincontent').empty();
            renderElements($('#results-template'), results);
            createChart($('#chart-container'), results);
        });
    });

    // On click of the edit (pencil) icon in the existing company list, bring up the input form with the clicked company's inputs.
    $('.maincontent').on('click', '#edit-company', function (e) {
        var queryItem = $(this).attr('name');
        // Make an ajax call to get the appropriate company.        
        $.get ('/editcompany', {queryItem: queryItem}, function (results) {
            $('.maincontent').empty();
            renderElements($('#editCo-template'), results);
            setTimeout( function () {
                showElements($('#editCo-container'));
                $('#first-input').focus();
            }, 0 );
        });
    });

    // On submit of the edit company form, send revised information to the server, show an updated valuation.
    $('.maincontent').on('submit', '#edit-company-form', function (e) {
        e.preventDefault();
        $.post ('/updatecompany', $('#edit-company-form').serialize(), function (results) {
            // Receive calculations from the server.  If user input was inaccurate, return an error message, else, render the calculation results.
            $('.maincontent').empty();
            // Server will send back a string "error" if the form was not fully completed or server will send an object with a "message" key if the data was out of range.
            if ( results === "error" || "message" in results ) {
                $('.maincontent').append('<p class="instructions">Invalid input, please try again.</p>');
            }
            else {
                renderElements($('#results-template'), results);
                createChart($('#chart-container'), results);
            }
        });
    });    

    // On click of the "x" button, delete the company.
    $('.maincontent').on('click', '#delete-company', function (e) {
        var queryItem = $(this).attr('name');
        // Make ajax call to delete the appropriate company.
        $.get ('/deletecompany', {queryItem: queryItem}, function (results) {
            $('.maincontent').empty();
            renderElements($('#confirm-template'), results);
            setTimeout( function () {
                showElements($('#confirm-container'));
            }, 0 );
        });
    });

    // On click of "about," show the about section.
    $('.introcontent').on('click', '#about', function (e) {
        $('.maincontent').empty();
        if ($('#about-container').length === 0) { 
            renderElements($('#about-template'));
            setTimeout( function () {
                showElements($('#about-container'));
            }, 0 );
        }
    });

    // On click of "clear," clear the main container.
    $('.introcontent').on('click', '#clear', function (e) {
        $('.maincontent').empty();
    });

});
