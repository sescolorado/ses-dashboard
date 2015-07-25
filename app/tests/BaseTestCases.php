<?php
/**
 * Various base classes containing helper functions for testing various functionality
 *
 * @author Laravel Project
 * @author ASD Software Design LLC
 */


/**
 * Starts a Laravel application in testing mode
 *
 * @author Laravel Project
  */
class TestCase extends Illuminate\Foundation\Testing\TestCase {

    /**
     * Create a Laravel application project that allows the standard Laravel libraries to be used in a test case.
     *
     * @author Laravel Project
     */
	public function createApplication()
	{
		$unitTesting = true;

		$testEnvironment = 'testing';

		return require __DIR__.'/../../bootstrap/start.php';
	}

}

/**
 * Base test case class use with the testing database.
 *
 * <p>Automatically removes the data in the database after <b>each</b> test.</p>
 *
 * @author ASD Software Design LLC
 */
class DatabaseTestCase extends TestCase {

    /**
     * Default preparation for each test
     */
    public function setUp()
    {
        parent::setUp();

        Artisan::call('migrate');
    }

    /**
     * Default destruction for each test
     */
    public function tearDown()
    {
        parent::tearDown();

        Artisan::call('migrate:reset');
    }
}
