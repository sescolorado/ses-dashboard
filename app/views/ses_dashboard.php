<!DOCTYPE html>
<!-- Sensible Energy Solutions LLC -->

<!--[if lt IE 7]>
<html lang="en" ng-app="ses_dashboard" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>
<html lang="en" ng-app="ses_dashboard" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>
<html lang="en" ng-app="ses_dashboard" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en" ng-app="ses_dashboard" class="no-js"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="Sensible Energy Solutions LLC">
    <!-- <link rel="icon" href="../../favicon.ico"> -->

    <!-- Stylesheets -->

    <link rel="stylesheet" href="bower_components/html5-boilerplate/css/normalize.css">
    <link rel="stylesheet" href="bower_components/html5-boilerplate/css/main.css">

    <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css"/>

    <link rel="stylesheet" href="css/app.css"/>


    <!-- JS that needs to load before page content is loaded -->

    <script src="bower_components/jquery/dist/jquery.min.js"></script>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="bower_components/html5shiv/dist/html5shiv.min.js"></script>
    <script src="bower_components/respond/dest/respond.min.js"></script>
    <![endif]-->

    <script src="bower_components/html5-boilerplate/js/vendor/modernizr-2.6.2.min.js"></script>

</head>
<body>

<nav id="navbar-example" class="navbar navbar-default" role="navigation" ng-init="navCollapsed = true">
    <div class="container">
        <div class="navbar-header">
            <button class="navbar-toggle" type="button" ng-click="navCollapsed = !navCollapsed">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">SES Dashboard</a>
        </div>
        <div collapse="navCollapsed" class="navbar-collapse bs-js-navbar-collapse">
            <ul class="nav navbar-nav">
                <li><a href="#/locations" role="button">All Locations</b></a></li>
                <li class="dropdown">
                    <a id="locationsDrop" href="#" role="button" class="dropdown-toggle" data-toggle="dropdown">
                        Featured Locations<b class="caret"></b>
                    </a>
                    <!-- EDIT DROPDOWNS HERE -->
                    <ul class="dropdown-menu" role="menu" aria-labelledby="locationsDrop">
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="#/location/cmu_bishop">
                                CMU Bishop Health Services Building
                            </a>
                        </li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="#/location/mc_hr_dept">
                                Mesa County Department of Human Resources
                            </a>
                        </li>
                        <li role="presentation">
                            <a role="menuitem" tabindex="-1" href="#/location/mc_fleet_maintenance">
                                Mesa County Fleet Maintenance Shop
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="#/about" role="button" >About</b></a></li>
            </ul>
        </div>
        <!-- /.nav-collapse -->
    </div>
    <!-- /.container-fluid -->
</nav>

<!--[if lt IE 9]>
<div class="container">
    <div class="alert alert-danger">
        You are using an <strong>outdated</strong> browser that is not supported by this application. Please
        <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.
    </div>
</div>
<![endif]-->

<div ng-view></div>

<div class="footer">
<!-- EDIT FOOTER HERE -->
    <div class="container">
        <p class="text-muted">&copy; 2014 Sensible Energy Solutions LLC</p>
    </div>
</div>

<!-- In production use:
<script src="//ajax.googleapis.com/ajax/libs/angularjs/x.x.x/angular.min.js"></script>
-->

<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-bootstrap/ui-bootstrap.min.js"></script>
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
<script src="bower_components/angular-route/angular-route.min.js"></script>

<script src="bower_components/holderjs/holder.js"></script>

<script src="bower_components/angular-google-chart/ng-google-chart.js"></script>

<script src="js/app.js"></script>
<script src="js/services.js"></script>
<script src="js/locations.js"></script>
<script src="js/controllers.js"></script>
<script src="js/filters.js"></script>
<script src="js/directives.js"></script>

<script src="js/ie10-viewport-bug-workaround.js"></script>

</body>
</html>
