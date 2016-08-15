<?php
class Calculator_Comparator_NotBeginTest extends PHPUnit_Framework_TestCase
{
    /** @var Meanbee_Shippingrules_Calculator_Registers */
    private $registers;

    /** @var Meanbee_Shippingrules_Calculator_Comparator_NotBegin */
    private $comparator;
    
    public function setUp()
    {
        require_once('src/app/Mage.php');
        Mage::app();
        
        $this->registers = new Meanbee_Shippingrules_Calculator_Registers;
        $this->comparator = new Meanbee_Shippingrules_Calculator_Comparator_NotBegin($this->registers);
    }

    public function testInstance()
    {
        $this->assertInstanceOf('Meanbee_Shippingrules_Calculator_Comparator_Abstract', $this->comparator);
    }

    public function testRegister()
    {
        $this->assertEquals(get_class($this->registers->getComparatorRegister()->get('notbegin')), get_class($this->comparator));
    }

    public function testTypes()
    {
        $this->assertTrue($this->comparator->canHandleType('string'));
    }

    public function testString()
    {
        $this->assertFalse($this->comparator->evaluate('a', 'abc', 'string'));

        $this->assertTrue($this->comparator->evaluate('b', 'abc', 'string'));
        $this->assertTrue($this->comparator->evaluate('c', 'abc', 'string'));
        $this->assertTrue($this->comparator->evaluate('d', 'abc', 'string'));
        $this->assertTrue($this->comparator->evaluate('A', 'abc', 'string'));

        $this->assertFalse($this->comparator->evaluate(array(
            'text' => 'BEGINS',
            'caseSensitive' => false
        ), 'beginsDifferentCases', 'string'));
        $this->assertTrue($this->comparator->evaluate(array(
            'text' => 'BEGINS',
            'caseSensitive' => true
        ), 'beginsDifferentCases', 'string'));
    }

    public function testExtensibility()
    {
        $this->comparator->addType('_testtype');
        $this->assertTrue($this->comparator->canHandleType('_testtype', false));
        $this->comparator->removeType('_testtype', false);
        $this->assertFalse($this->comparator->canHandleType('_testtype', false));
    }
}