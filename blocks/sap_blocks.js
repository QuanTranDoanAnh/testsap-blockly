// Define a custom theme for TestSage blocks
Blockly.Themes.TestSage = Blockly.Theme.defineTheme('testsage', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
        'sap_blocks': {
            'colourPrimary': '#2E7D32',  // SAP green
            'colourSecondary': '#1B5E20',
            'colourTertiary': '#4CAF50'
        },
        'validation_blocks': {
            'colourPrimary': '#1976D2',  // Blue for validations
            'colourSecondary': '#0D47A1',
            'colourTertiary': '#42A5F5'
        },
        'flow_blocks': {
            'colourPrimary': '#F57C00',  // Orange for flow control
            'colourSecondary': '#E65100',
            'colourTertiary': '#FFB74D'
        }
    }
});

// 1. Transaction Block (Container)
Blockly.Blocks['sap_transaction'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_transaction",
            "message0": "Begin Transaction %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "TCODE",
                    "text": "ME51N"
                }
            ],
            "message1": "Actions %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "ACTIONS",
                    "check": ["sap_action", "validation", "flow_control"]
                }
            ],
            "message2": "End Transaction",
            "previousStatement": null,
            "nextStatement": null,
            "style": "sap_blocks",
            "tooltip": "SAP Transaction container",
            "helpUrl": ""
        });
    }
};

// 2. Enter Field Action
Blockly.Blocks['sap_enter_field'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_enter_field",
            "message0": "Enter Field %1 value: %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "FIELD_NAME",
                    "text": "Material"
                },
                {
                    "type": "input_value",
                    "name": "VALUE",
                    "check": ["String", "Number", "Variable"]
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "sap_blocks",
            "tooltip": "Enter value into SAP field",
            "helpUrl": ""
        });
    }
};

// 3. Click Button Action
Blockly.Blocks['sap_click_button'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_click_button",
            "message0": "Click Button %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "BUTTON_NAME",
                    "text": "Save"
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "sap_blocks",
            "tooltip": "Click SAP button",
            "helpUrl": ""
        });
    }
};

// 4. Validation Block
Blockly.Blocks['sap_validate_message'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_validate_message",
            "message0": "Validate Message %1 %2",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "OPERATOR",
                    "options": [
                        ["contains", "contains"],
                        ["equals", "equals"],
                        ["starts with", "starts_with"],
                        ["ends with", "ends_with"]
                    ]
                },
                {
                    "type": "field_input",
                    "name": "EXPECTED",
                    "text": "Success"
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "validation_blocks",
            "tooltip": "Validate SAP message",
            "helpUrl": ""
        });
    }
};

// 5. If/Else Flow Control
Blockly.Blocks['sap_if_field_exists'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_if_field_exists",
            "message0": "If FieldExists %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "FIELD_NAME",
                    "text": "Vendor"
                }
            ],
            "message1": "then %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "THEN_ACTIONS",
                    "check": ["sap_action", "validation", "flow_control"]
                }
            ],
            "message2": "else %1",
            "args2": [
                {
                    "type": "input_statement",
                    "name": "ELSE_ACTIONS",
                    "check": ["sap_action", "validation", "flow_control"]
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "flow_blocks",
            "tooltip": "Conditional execution based on field existence",
            "helpUrl": ""
        });
    }
};

// 6. Variable/Parameter Block
Blockly.Blocks['sap_variable'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_variable",
            "message0": "${%1}",
            "args0": [
                {
                    "type": "field_input",
                    "name": "VAR_NAME",
                    "text": "material"
                }
            ],
            "output": ["String", "Number", "Variable"],
            "style": "sap_blocks",
            "tooltip": "Variable reference",
            "helpUrl": ""
        });
    }
};

// 7. Store Field Value
Blockly.Blocks['sap_store_field'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_store_field",
            "message0": "Store Field %1 as: %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "FIELD_NAME",
                    "text": "PR Number"
                },
                {
                    "type": "field_input",
                    "name": "VAR_NAME",
                    "text": "pr_number"
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "sap_blocks",
            "tooltip": "Store field value in variable",
            "helpUrl": ""
        });
    }
};

// 8. Loop Block
Blockly.Blocks['sap_for_each'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_for_each",
            "message0": "For Each %1 in %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "ITEM_VAR",
                    "text": "item"
                },
                {
                    "type": "input_value",
                    "name": "LIST",
                    "check": ["Array", "Variable"]
                }
            ],
            "message1": "do %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO",
                    "check": ["sap_action", "validation", "flow_control"]
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "flow_blocks",
            "tooltip": "Loop through items",
            "helpUrl": ""
        });
    }
};

// 9. SubFlow Call
Blockly.Blocks['sap_subflow'] = {
    init: function() {
        this.jsonInit({
            "type": "sap_subflow",
            "message0": "SubFlow %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "SUBFLOW_NAME",
                    "text": "Approve PR"
                }
            ],
            "message1": "with parameters %1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "PARAMETERS",
                    "check": "parameter_assignment"
                }
            ],
            "previousStatement": ["sap_action", "validation", "flow_control"],
            "nextStatement": ["sap_action", "validation", "flow_control"],
            "style": "sap_blocks",
            "tooltip": "Call a subflow",
            "helpUrl": ""
        });
    }
};

// 10. Parameter Assignment (for SubFlow)
Blockly.Blocks['parameter_assignment'] = {
    init: function() {
        this.jsonInit({
            "type": "parameter_assignment",
            "message0": "%1 : %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "PARAM_NAME",
                    "text": "pr_number"
                },
                {
                    "type": "input_value",
                    "name": "PARAM_VALUE",
                    "check": ["String", "Number", "Variable"]
                }
            ],
            "previousStatement": "parameter_assignment",
            "nextStatement": "parameter_assignment",
            "style": "sap_blocks",
            "tooltip": "Parameter assignment",
            "helpUrl": ""
        });
    }
};