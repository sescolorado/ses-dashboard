<?php
/**
 * Routes for the SES Dashboad Application
 *
 * <p>Links the PHP functions with the location path.</p>
 *
 * @author ASD Software Design LLC
 */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	return View::make('ses_dashboard');
});

Route::get('/energystat/locations', 'EnergyStatController@locationsJSON');

Route::get('/energystat/fields/{location}', 'EnergyStatController@fieldsJSON');

Route::get('/energystat/range/{location}', 'EnergyStatController@rangeJSON');

Route::post('/energystat/read/{location}', 'EnergyStatController@readJSON');
