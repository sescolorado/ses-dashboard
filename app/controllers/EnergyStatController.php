<?php
/**
 * Controller for processing web service requests for energy statistics
 *
 * @author ASD Software Design LLC
 */

/**
 * Controller for processing web service requests for energy statistics
 *
 * @author ASD Software Design LLC
 */
class EnergyStatController extends \BaseController {

	/**
	 * Retrieve the energy stat fields for a location
	 *
     * $param string $location energy stat location
     * @return array|null data array on success - null on failure
	 */
	public function fields($location)
	{
        $locations = $this->locations();

        if (!in_array($location, $locations))
            return null;

        $results = DB::select('SELECT `column_name` FROM `information_schema`.`columns` WHERE `table_name` = "'
            . $location
            . '" AND `table_schema` = "'
            . DB::connection()->getConfig('database')
            . '" ORDER BY `column_name` ASC');

        $fields = array();

        foreach ($results as $result) {
            array_push($fields, $result->column_name);
        }

        return $fields;
	}

    /**
     * Retrieve the energy stat fields for a location in JSON format.
     *
     * $param string $location energy stat location
     * @return Response
     */
    public function fieldsJSON($location)
    {
        $fields = $this->fields($location);
        if ($fields == null)
            return Response::json('Invalid location specified.', 404)->setCallback(Input::get('callback'));
        return Response::json($fields)->setCallback(Input::get('callback'));
    }

    /**
     * Retrieve the energy stat locations.
     *
     * @return array data array on success
     */
    public function locations()
    {
        $results = DB::select('SELECT `table_name` FROM `information_schema`.`tables` WHERE `table_type` = "BASE TABLE" AND `table_name` != "migrations" AND `table_schema` = "'
            . DB::connection()->getConfig('database')
            . '" ORDER BY `table_name` ASC');

        $tables = array();

        foreach ($results as $result) {
            array_push($tables, $result->table_name);
        }

        return $tables;
    }

    /**
     * Retrieve the energy stat locations in JSON format.
     *
     * @return Response
     */
    public function locationsJSON()
    {
        return Response::json($this->locations())->setCallback(Input::get('callback'));
    }

    /**
     * Retrieve the energy stats date range for a location
     *
     * $param string $location energy stat location
     * @return array|null date range array on success - null on failure
     */
    public function range($location)
    {
        $locations = $this->locations();

        if (!in_array($location, $locations))
            return null;

        $results = DB::select('SELECT MIN(`timeUTC`) AS MINtimeUTC, MAX(`timeUTC`) as MAXtimeUTC FROM `' . $location . '`');

        $ranges = array();

        foreach ($results as $result) {
            array_push($ranges, $result->MINtimeUTC);
            array_push($ranges, $result->MAXtimeUTC);
        }

        return $ranges;
    }

    /**
     * Retrieve the energy stats date range or a location in JSON format
     *
     * $param string $location energy stat location
     * @return Response
     */
    public function rangeJSON($location)
    {
        $ranges = $this->range($location);
        if ($ranges == null)
            return Response::json('Invalid location specified.', 404)->setCallback(Input::get('callback'));
        return Response::json($ranges)->setCallback(Input::get('callback'));
    }

    /**
     * Retrieve the energy stats for a location
     *
     * $param string $location energy stat location
     * $param string $timeFrom data set time to start from
     * $param string $timeTo data set time to end on
     * $param array $fields array of strings of requested field names
     * @return array|null data array on success - null on failure
     */
    public function read($location, $timeFrom, $timeTo, $fieldsRequested)
    {
        $locations = $this->locations();

        if (!in_array($location, $locations))
            return null;

        $read = array();
        $read['errors'] = array();

        $fieldsValid = array();

        $fields = $this->fields($location);
        foreach ($fieldsRequested as $fieldRequested) {
            if (in_array($fieldRequested, $fields))
                array_push($fieldsValid, $fieldRequested);
            else
                array_push($read['errors'], 'Requested field ' . $fieldRequested . ' not found.');
        }

        $timeFrom = preg_replace('/(?:(?![0-9 -:]).)*/i', '', $timeFrom);
        $timeTo = preg_replace('/(?:(?![0-9 -:]).)*/i', '', $timeTo);

        $data = array();

        $sql = 'SELECT timeUTC';
        $data['timeUTC'] = array();

        for ($i = 0; $i < count($fieldsValid); $i++) {
            $sql = $sql . ', `' . $fieldsValid[$i] . '`';
            $data[$fieldsValid[$i]] = array();
        }
        $sql = $sql . ' FROM `' . $location . '` WHERE timeUTC >= "' . $timeFrom . '" AND timeUTC < "' . $timeTo . '" ORDER BY timeUTC ASC';

        $results = DB::select($sql);
        foreach($results as $result) {
            foreach($result as $key => $item) {
                if (is_numeric($item))
                    array_push($data[$key], $item + 0);
                else
                    array_push($data[$key], $item);
            }
        }

        $read['data'] = $data;

        return $read;
    }

    /**
     * Retrieve the energy stats for a location in JSON format
     *
     * $param string $location energy stat location
     * @return Response
     */
    public function readJSON($location)
    {
        $input = Input::all();

        if ($input == null || count($input) <= 0)
            return Response::json('No input.', 400)->setCallback(Input::get('callback'));

        if (!array_key_exists('timeFrom', $input))
            return Response::json('No timeFrom field in input.', 400)->setCallback(Input::get('callback'));

        if (!array_key_exists('timeTo', $input))
            return Response::json('No timeTo field in input.', 400)->setCallback(Input::get('callback'));

        if (!array_key_exists('fields', $input))
            return Response::json('No fields array in input.', 400)->setCallback(Input::get('callback'));

        $read = $this->read($location, $input['timeFrom'], $input['timeTo'], $input['fields']);

        if ($read == null)
            return Response::json('Invalid location specified.', 404)->setCallback(Input::get('callback'));

        return Response::json($read)->setCallback(Input::get('callback'));
    }

}
