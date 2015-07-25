<?php
/**
 * Migrates the mc_courthouse database
 *
 * @author ASD Software Design LLC
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Migrates the mc_courthouse database
 *
 * @author ASD Software Design LLC
 */
class CreateMcCourthouseTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('mc_courthouse', function(Blueprint $table)
		{
            $table->engine = 'InnoDB';

			$table->increments('id');
			$table->dateTime('timeUTC')->unique();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('mc_courthouse');
	}

}
