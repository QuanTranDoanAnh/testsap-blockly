// Define the toolbox structure
var toolboxXML = `
<xml id="toolbox" style="display: none">
    <category name="SAP Transactions" colour="#2E7D32">
        <block type="sap_transaction"></block>
    </category>
    
    <category name="SAP Actions" colour="#2E7D32">
        <block type="sap_enter_field">
            <value name="VALUE">
                <block type="sap_variable"></block>
            </value>
        </block>
        <block type="sap_click_button"></block>
        <block type="sap_store_field"></block>
        <block type="sap_subflow"></block>
    </category>
    
    <category name="Validations" colour="#1976D2">
        <block type="sap_validate_message"></block>
    </category>
    
    <category name="Flow Control" colour="#F57C00">
        <block type="sap_if_field_exists"></block>
        <block type="sap_for_each"></block>
    </category>
    
    <category name="Variables" colour="#9C27B0">
        <block type="sap_variable"></block>
        <block type="parameter_assignment"></block>
    </category>
    
    <sep></sep>
    
    <category name="Examples" colour="#795548">
        <block type="sap_transaction">
            <field name="TCODE">ME51N</field>
            <statement name="ACTIONS">
                <block type="sap_enter_field">
                    <field name="FIELD_NAME">Material</field>
                    <value name="VALUE">
                        <block type="sap_variable">
                            <field name="VAR_NAME">material</field>
                        </block>
                    </value>
                    <next>
                        <block type="sap_click_button">
                            <field name="BUTTON_NAME">Save</field>
                        </block>
                    </next>
                </block>
            </statement>
        </block>
    </category>
</xml>`;

// Initialize Blockly workspace
var workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxXML,
    theme: Blockly.Themes.TestSage,
    grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
    },
    trashcan: true,
    sounds: true,
    media: 'https://unpkg.com/blockly/media/',
    renderer: 'geras'  // Modern renderer
});

// Function to generate and display code
function generateCode() {
    try {
        var code = Blockly.TestSageDSL.workspaceToCode(workspace);
        document.getElementById('generatedCode').value = code;
    } catch (e) {
        console.error('Error generating code:', e);
        document.getElementById('generatedCode').value = 'Error: ' + e.toString();
    }
}

// Add event listener to regenerate code when blocks change
workspace.addChangeListener(function(event) {
    if (event.type !== Blockly.Events.UI) {
        generateCode();
    }
});

// Generate initial code
generateCode();

// Add some helper functions for the workspace
window.TestSageEditor = {
    // Clear the workspace
    clearWorkspace: function() {
        workspace.clear();
    },
    
    // Load blocks from JSON
    loadFromJSON: function(json) {
        workspace.clear();
        Blockly.serialization.workspaces.load(json, workspace);
    },
    
    // Save blocks to JSON
    saveToJSON: function() {
        return Blockly.serialization.workspaces.save(workspace);
    },
    
    // Get generated DSL code
    getDSLCode: function() {
        return Blockly.TestSageDSL.workspaceToCode(workspace);
    },
    
    // Load example test
    loadExample: function() {
        var exampleXML = `
        <xml>
            <block type="sap_transaction" x="50" y="50">
                <field name="TCODE">ME51N</field>
                <statement name="ACTIONS">
                    <block type="sap_enter_field">
                        <field name="FIELD_NAME">Material</field>
                        <value name="VALUE">
                            <block type="sap_variable">
                                <field name="VAR_NAME">material</field>
                            </block>
                        </value>
                        <next>
                            <block type="sap_enter_field">
                                <field name="FIELD_NAME">Quantity</field>
                                <value name="VALUE">
                                    <block type="sap_variable">
                                        <field name="VAR_NAME">quantity</field>
                                    </block>
                                </value>
                                <next>
                                    <block type="sap_if_field_exists">
                                        <field name="FIELD_NAME">Vendor</field>
                                        <statement name="THEN_ACTIONS">
                                            <block type="sap_enter_field">
                                                <field name="FIELD_NAME">Vendor</field>
                                                <value name="VALUE">
                                                    <block type="sap_variable">
                                                        <field name="VAR_NAME">vendor</field>
                                                    </block>
                                                </value>
                                            </block>
                                        </statement>
                                        <next>
                                            <block type="sap_click_button">
                                                <field name="BUTTON_NAME">Save</field>
                                                <next>
                                                    <block type="sap_validate_message">
                                                        <field name="OPERATOR">contains</field>
                                                        <field name="EXPECTED">Purchase requisition</field>
                                                        <next>
                                                            <block type="sap_store_field">
                                                                <field name="FIELD_NAME">PR Number</field>
                                                                <field name="VAR_NAME">pr_number</field>
                                                            </block>
                                                        </next>
                                                    </block>
                                                </next>
                                            </block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>`;
        
        workspace.clear();
        var xml = Blockly.utils.xml.textToDom(exampleXML);
        Blockly.Xml.domToWorkspace(xml, workspace);
    }
};