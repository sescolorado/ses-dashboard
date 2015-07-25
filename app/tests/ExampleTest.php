<?php
/**
 * An example test case to use as a template for future test cases.
 *
 * @author Laravel Project
 */

/**
 * Example test case to ensure testing is working.
 *
 * @author Laravel Project
 */
class ExampleTest extends TestCase {

	/**
	 * A basic functional test example.
	 *
	 * @return void
	 */
	public function testBasicExample()
	{
		$crawler = $this->client->request('GET', '/');

		$this->assertTrue($this->client->getResponse()->isOk());
	}
}
