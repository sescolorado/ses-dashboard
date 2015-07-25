<?php
/**
 * Migrates the mc_workforce database
 *
 * @author ASD Software Design LLC
 */

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Migrates the mc_workforce database
 *
 * @author ASD Software Design LLC
 */
class CreateMcWorkforceTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('mc_workforce', function(Blueprint $table)
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
		Schema::drop('mc_workforce');
	}

}
