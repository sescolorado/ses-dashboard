<?php
/**
 * Tests for the energystat controller
 *
 * @author ASD Software Design LLC
 */

/**
 * Tests for the energystat controller
 *
 * @author ASD Software Design LLC
 */
class EnergyStatControllerTest extends DatabaseTestCase {

    /**
     * Test pulling data from the energystat controller
     *
     * @author ASD Software Design LLC
     */
    public function testEnergyStatEnergyStatController()
    {

        $output = array();
        $return_var = 0;
        exec('mysql -u ' . DB::connection()->getConfig('username')
            . ' -p"' . DB::connection()->getConfig('password') . '"'
            . ' -h ' . DB::connection()->getConfig('host')
            . ' ' . DB::connection()->getConfig('database')
            . ' < test_data/dump/ses_dashboard.sql', $output, $return_var);
        $this->assertEquals(0, $return_var);

        $results = DB::select('SELECT COUNT(1) AS COUNT FROM `mc_courthouse`');
        $this->assertEquals(1, count($results));
        $this->assertEquals(12633, $results[0]->COUNT);

        $crawler = $this->client->request('GET', '/energystat/locations');
        $this->assertTrue($this->client->getResponse()->isOk());

        $response = json_decode($this->client->getResponse()->getContent());
        $this->assertNotNull($response);

        $this->assertEquals(4, count($response));
        $this->assertTrue(in_array('mc_courthouse', $response));

        $crawler = $this->client->request('GET', '/energystat/fields/' . '\'drop tables where 1=1;');
        $this->assertTrue($this->client->getResponse()->isNotFound());

        $crawler = $this->client->request('GET', '/energystat/fields/' . 'mc_courthouse');
        $this->assertTrue($this->client->getResponse()->isOk());

        $response = json_decode($this->client->getResponse()->getContent());
        $this->assertNotNull($response);

        $this->assertEquals(103, count($response));
        $this->assertTrue(in_array('1st_Floor_Occupied_Ave_Degrees_F', $response));
        $this->assertTrue(in_array('Return_boiler_Degrees_F', $response));
        $this->assertTrue(in_array('Total_Real_Power_Max_Demand_Import_kW', $response));

        $request = array('timeTo' => '2014-03-18', 'fields' => array('1st_Floor_Occupied_Degrees_F', 'Basement_office_Degrees_F', 'Supply_boiler_Degrees_F', 'Total_Net_Instantaneous_Real_Power_kW'));
        $crawler = $this->client->request('POST', '/energystat/read/' . 'mc_courthouse', $request, array(), array('Content-Type' => 'application/json;charset=utf-8'));
        $this->assertTrue($this->client->getResponse()->isClientError());

        $request = array('timeFrom' => '2014-03-11', 'fields' => array('1st_Floor_Occupied_Degrees_F', 'Basement_office_Degrees_F', 'Supply_boiler_Degrees_F', 'Total_Net_Instantaneous_Real_Power_kW'));
        $crawler = $this->client->request('POST', '/energystat/read/' . 'mc_courthouse', $request, array(), array('Content-Type' => 'application/json;charset=utf-8'));
        $this->assertTrue($this->client->getResponse()->isClientError());

        $request = array('timeFrom' => '2014-03-11', 'timeTo' => '2014-03-18');
        $crawler = $this->client->request('POST', '/energystat/read/' . 'mc_courthouse', $request, array(), array('Content-Type' => 'application/json;charset=utf-8'));
        $this->assertTrue($this->client->getResponse()->isClientError());

        $request = array('timeFrom' => '2014-03-11', 'timeTo' => '2014-03-18', 'fields' => array('1st_Floor_Occupied_Degrees_F', 'Basement_office_Degrees_F', 'Supply_boiler_Degrees_F', 'Total_Net_Instantaneous_Real_Power_kW'));
        $crawler = $this->client->request('POST', '/energystat/read/' . 'mc_courthouse', $request, array(), array('Content-Type' => 'application/json;charset=utf-8'));
        $this->assertTrue($this->client->getResponse()->isOk());

        $response = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertNotNull($response);

        $this->assertTrue(array_key_exists('errors', $response));
        $this->assertTrue(array_key_exists('data', $response));

        $this->assertTrue(array_key_exists('1st_Floor_Occupied_Degrees_F', $response['data']));
        $this->assertTrue(array_key_exists('Basement_office_Degrees_F', $response['data']));
        $this->assertTrue(array_key_exists('Supply_boiler_Degrees_F', $response['data']));
        $this->assertTrue(array_key_exists('Total_Net_Instantaneous_Real_Power_kW', $response['data']));

        $this->assertEquals(602, count($response['data']['1st_Floor_Occupied_Degrees_F']));
        $this->assertEquals(602, count($response['data']['Basement_office_Degrees_F']));
        $this->assertEquals(602, count($response['data']['Supply_boiler_Degrees_F']));
        $this->assertEquals(602, count($response['data']['Total_Net_Instantaneous_Real_Power_kW']));

        $this->assertEquals(null, $response['data']['1st_Floor_Occupied_Degrees_F'][0]);
        $this->assertEquals(null, $response['data']['1st_Floor_Occupied_Degrees_F'][601]);

        $this->assertEquals(71.59, $response['data']['Basement_office_Degrees_F'][0]);
        $this->assertEquals(70.87, $response['data']['Basement_office_Degrees_F'][601]);

        $this->assertEquals(156.18, $response['data']['Supply_boiler_Degrees_F'][0]);
        $this->assertEquals(152.11, $response['data']['Supply_boiler_Degrees_F'][601]);

        $this->assertEquals(142.44, $response['data']['Total_Net_Instantaneous_Real_Power_kW'][0]);
        $this->assertEquals(165.02, $response['data']['Total_Net_Instantaneous_Real_Power_kW'][601]);

    }

}
