<?php
/**
 * Command for importing energy stats into a MySQL database from a CSV file
 *
 * @author ASD Software Design LLC
 */

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

/**
 * Helper class for storing import column information
 *
 * @author ASD Software Design LLC
 */
class EnergyStatCSVImportColumn {

    const UNKNOWN = 0;
    const DATETIME = 1;
    const STRING = 2;
    const DOUBLE = 3;
    const INT = 4;

    /**
     * Column name
     *
     * @var string
     */
    public $name;

    /**
     * Column name validity
     *
     * @var bool
     */
    public $valid;

    /**
     * Column exists in the MySQL database
     *
     * @var bool
     */
    public $exists = false;

    /**
     * Default constructor
     *
     * @author ASD Software Design LLC
     */
    public function __construct($name, $valid) {
        $this->name = $name;
        $this->valid = $valid;
    }

    /**
     * Default toString
     *
     * @return string
     * @author ASD Software Design LLC
     */
    public function __toString() {
        return $this->name . ',' . ($this->valid ? 'true' : 'false') . ',' . ($this->exists ? 'true' : 'false');
    }

    /**
     * Predicts the type of the value in the CSV file for use in a MySQL database
     *
     * @param string $file complete path of the CSV file containing the column
     * @param integer $index of the column in the CSV file
     * @param mixed $item one of the values from the column in the CSV file specified by the index (attempt at an optimization)
     * @return integer column type
     * @author ASD Software Design LLC
     */
    static public function predictType($file, $index, $item) {

        if (!empty($item) && !is_numeric($item)) {
            try {
                $dateTime = new DateTime($item);
                return EnergyStatCSVImportColumn::DATETIME;
            } catch (Exception $e) {}
            return EnergyStatCSVImportColumn::STRING;
        }

        $handle = fopen($file, 'r');

        if ($handle == false || fgetcsv($handle) == false) {
            return false;
        }

        $retVal = EnergyStatCSVImportColumn::UNKNOWN;

        while (($row = fgetcsv($handle)) != false) {

            $anotherItem = $row[$index];

            if (!empty($anotherItem) && !is_numeric($anotherItem)) {
                return EnergyStatCSVImportColumn::STRING;
            } else if (is_numeric($anotherItem) && $retVal != EnergyStatCSVImportColumn::DOUBLE) {
                if (gettype($anotherItem + 0) == 'double')
                    $retVal = EnergyStatCSVImportColumn::DOUBLE;
                else
                    $retVal = EnergyStatCSVImportColumn::INT;
            }
        }

        return $retVal;
    }
}


/**
 * Command used to import CSV files into the database
 *
 * @author ASD Software Design LLC
 */
class EnergyStatCSVImport extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'energy-stat:csv-import';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Imports Engery Statistics in CSV format into the configured MySQL database.';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

    /**
     * Execute the console command.
     *
     * @return mixed
     * @author ASD Software Design LLC
     */
    public function fire()
    {
        $table = $this->argument('table');

        $files = $this->option('file');
        $directories = $this->option('directory');

        if ($files == null && $directories == null) {
            $this->info('At least one file or directory must be specified.');
        }

        if ($files != null) {
            foreach($files as $file) {
                $handle = fopen($file, 'r');
                if ($handle == false) {
                    $this->info($file . ' does not exist or could not be opened');
                    return;
                }
            }
            foreach($files as $file) {
                $info = $this->importFile($table, $file);
                if ($info != null) {
                    $this->info($info);
                    break;
                }
            }
        }

        if ($directories != null) {
            foreach($directories as $directory) {
                if (!is_dir($directory)) {
                    $this->info($directory . ' does not exist');
                    return;
                }
            }
            foreach($directories as $directory) {
                $info = $this->importDirectory($table, $directory);
                if ($info != null) {
                    $this->info($info);
                    break;
                }
            }
        }
    }

    /**
     * Get the console command arguments.
     *
     * @return array
     * @author ASD Software Design LLC
     */
    protected function getArguments()
    {
        return array(
            array('table', InputArgument::REQUIRED, 'Destination import table.'),
        );
    }

    /**
     * Get the console command options.
     *
     * @return array
     * @author ASD Software Design LLC
     */
    protected function getOptions()
    {
        return array(
            array('file', 'f', InputOption::VALUE_OPTIONAL | InputOption::VALUE_IS_ARRAY, 'Files to import', null),
            array('directory', 'd', InputOption::VALUE_OPTIONAL | InputOption::VALUE_IS_ARRAY, 'Directories to import', null),
        );
    }

    /**
     * Imports all the files in the specified directory into a MySQL database
     *
     * @param string $table name of the table
     * @param string $directory complete path of the directory containing CSV files
     * @return null|string null on success - string containing error on failure
     * @author ASD Software Design LLC
     */
    public function importDirectory($table, $directory)
    {
        if (!is_dir($directory))
            return $directory . ' does not exist';

        $it = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST,
            RecursiveIteratorIterator::CATCH_GET_CHILD
        );

        foreach ($it as $path => $item) {

            if (!$item->isDir()) {

                preg_match('/.*\.csv$/', $path, $matches);

                if (count($matches) == 0)
                    continue;

                print('.');

                $retVal = $this->importFile($table, $path);

                if ($retVal != null)
                    return $retVal;
            }
        }

        return null;
    }

    /**
     * Imports a single file into a MySQL database
     *
     * @param string $table name of the table
     * @param string $file complete path of the directory containing CSV files
     * @return null|string null on success - string containing error on failure
     * @author ASD Software Design LLC
     */
    public function importFile($table, $file)
    {
        $tableSanitized = preg_replace('/(?:(?![a-zA-Z0-9_]).)*/i', '', $table);

        if ($table != $tableSanitized) {
            return 'Table name may only contain alphanumeric and underscore characters.';
        }

        if (!Schema::hasTable($table)) {
            return 'Please create a table through a migration before importing data.';
        }

        if (!Schema::hasColumn($table, 'timeUTC')) {
            return 'The column timeUTC does not exist in the table ' . $table . ' - it is used as a key for importing the energy stat data';
        }

        $handle = fopen($file, 'r');

        if ($handle == false) {
            return $file . ' does not exist or could not be opened.';
        }

        $names = fgetcsv($handle);

        if ($names == false) {
            return $file . ' does not contain file headers.';
        }

        $columns = array();

        foreach($names as $name) {

            $name = str_replace(' ', '_', $name);

            $name = preg_replace('/(?:(?![a-zA-Z0-9_\x7f-\xff]).)*/i', '', $name);

            preg_match('/[a-zA-Z0-9_\x7f-\xff]*/', $name, $matches);

            if (count($matches) > 0) {
                array_push($columns, new EnergyStatCSVImportColumn($matches[0], true));
            }
            else {
                array_push($columns, new EnergyStatCSVImportColumn($name, false));
            }
        }

        foreach($columns as $column) {
            if ($column->valid)
                $column->exists = Schema::hasColumn($table, $column->name);
        }

        $types = array();

        while (($row = fgetcsv($handle)) != false) {

            $valueTimeUTC = null;

            $values = array();

            for ($i = 0; $i < count($row) && $i < count($columns); $i++) {

                $item = $row[$i];

                if (!is_numeric($item) && empty($item)) {
                    array_push($values, null);
                    continue;
                }

                if ($columns[$i]->name == 'timeUTC') {

                    $results = DB::select('SELECT `timeUTC` FROM `' . $table . '` WHERE `timeUTC` = ?', array($item));

                    if (count($results) == 0)
                        DB::insert('INSERT INTO `' . $table . '` (`timeUTC`) VALUES (?)', array($item));

                    array_push($values, null);
                    $valueTimeUTC = $item;

                } else {

                    if (!$columns[$i]->valid)
                        return 'In ' . $table . ' column ' . $columns[$i]->name . ' is an invalid name but column has valid data.';

                    if ($columns[$i]->exists) {
                        array_push($values, $item);
                    } else {

                        if (count($types) < $i + 1 || $types[$i] == null)
                            $types[$i] = EnergyStatCSVImportColumn::predictType($file, $i, $item);

                        switch($types[$i]) {

                            case EnergyStatCSVImportColumn::UNKNOWN:
                                break;

                            case EnergyStatCSVImportColumn::DATETIME:
                                print('Adding column ' . $columns[$i]->name . ' to table ' . $table . ' as a DATETIME' . "\n");
                                DB::statement('ALTER TABLE `' . $table . '` ADD  COLUMN `' . $columns[$i]->name . '` DATETIME');
                                break;

                            case EnergyStatCSVImportColumn::STRING:
                                print('Adding column ' . $columns[$i]->name . ' to table ' . $table . ' as a VARCHAR(255)' . "\n");
                                DB::statement('ALTER TABLE `' . $table . '` ADD  COLUMN `' . $columns[$i]->name . '` VARCHAR(255)');
                                break;

                            case EnergyStatCSVImportColumn::INT:
                                print('Adding column ' . $columns[$i]->name . ' to table ' . $table . ' as an INTEGER' . "\n");
                                DB::statement('ALTER TABLE `' . $table . '` ADD  COLUMN `' . $columns[$i]->name . '` INTEGER');
                                break;

                            case EnergyStatCSVImportColumn::DOUBLE:
                                print('Adding column ' . $columns[$i]->name . ' to table ' . $table . ' as a DOUBLE' . "\n");
                                DB::statement('ALTER TABLE `' . $table . '` ADD  COLUMN `' . $columns[$i]->name . '` DOUBLE');
                                break;

                            default:
                                return 'In ' . $table . ' column ' . $columns[$i]->name . ' could not be created.';
                                break;

                        }

                        if ($types[$i] == EnergyStatCSVImportColumn::UNKNOWN) {
                            array_push($values, null);
                        } else {
                            array_push($values, $item);
                            $columns[$i]->exists = true;
                        }
                    }
                }
            }

            if (count($columns) != count($values))
                return 'Column/value count mismatch importing CSV into table ' . $table . '.';

            if ($valueTimeUTC == null)
                return 'Cannot update table ' . $table . ' if there is no time key.';

            $set = array();
            $updatedValues = array();
            for ($i = 0; $i < count($values) && $i < count($columns); $i++) {

                if ($columns[$i]->valid && $columns[$i]->exists && $values[$i] != null) {
                    array_push($set, $columns[$i]->name . ' = ?');
                    array_push($updatedValues, $values[$i]);
                }
            }

            array_push($updatedValues, $valueTimeUTC);

            DB::update('UPDATE `' . $table . '` SET ' . implode(', ', $set) . ' WHERE `timeUTC` = ?', $updatedValues);
        }

        return null;
    }

}
