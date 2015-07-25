<?php
/**
 * Tests for the energy-stat:csv-import command
 *
 * @author ASD Software Design LLC
 */

/**
 * Tests importing CSV files into a MySQL database using the energy-stat:csv-import command
 *
 * @author ASD Software Design LLC
 */
class EnergyStatCSVImportTest extends DatabaseTestCase {

    /**
     * Tests importing a weeks of files from the Courthouse data set.
     *
     * @author ASD Software Design LLC
     */
    public function testEnergyStatCSVImport() {

        $csvImport = new EnergyStatCSVImport();

        $this->assertEquals(null, $csvImport->importFile('mc_courthouse', 'test_data/mb-001.53203098_2.log.csv'));

        $this->assertEquals(null, $csvImport->importDirectory('mc_courthouse', 'test_data/Courthouse'));

        $results = DB::select('SELECT COUNT(1) AS COUNT FROM `mc_courthouse`');

        $this->assertEquals(1, count($results));
        $this->assertEquals(836, $results[0]->COUNT);
    }

}
