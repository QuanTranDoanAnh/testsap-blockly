// Create a custom generator for TestSage DSL
Blockly.TestSageDSL = new Blockly.Generator('TestSageDSL');

// Configure the generator
Blockly.TestSageDSL.addReservedWords(
    'Begin,End,Transaction,Enter,Field,Click,Button,Validate,Message,' +
    'If,ElseIf,Else,EndIf,For,Each,EndFor,SubFlow,with,Store,as'
);

// Helper function for indentation
Blockly.TestSageDSL.INDENT = '  ';

// Initialize the generator
Blockly.TestSageDSL.init = function(workspace) {
    // Initialize variable database
    Blockly.TestSageDSL.nameDB_ = new Blockly.Names(Blockly.TestSageDSL.RESERVED_WORDS_);
    Blockly.TestSageDSL.nameDB_.setVariableMap(workspace.getVariableMap());
    
    // Reset indentation level
    Blockly.TestSageDSL.indentLevel = 0;
};

// Finalize code generation
Blockly.TestSageDSL.finish = function(code) {
    // Clean up the code
    return code.trim();
};

// Helper to get indentation
Blockly.TestSageDSL.getIndent = function() {
    return Blockly.TestSageDSL.INDENT.repeat(Blockly.TestSageDSL.indentLevel);
};

// 1. Transaction Block Generator
Blockly.TestSageDSL['sap_transaction'] = function(block) {
    var tcode = block.getFieldValue('TCODE');
    var actions = Blockly.TestSageDSL.statementToCode(block, 'ACTIONS');
    
    var code = 'Begin Transaction "' + tcode + '"\n';
    if (actions) {
        // Actions are already indented from their generators
        code += actions;
    }
    code += 'End Transaction\n';
    
    return code;
};

// 2. Enter Field Generator
Blockly.TestSageDSL['sap_enter_field'] = function(block) {
    var fieldName = block.getFieldValue('FIELD_NAME');
    var value = Blockly.TestSageDSL.valueToCode(block, 'VALUE', 
        Blockly.TestSageDSL.ORDER_NONE) || '""';
    
    // Remove extra quotes if value is already quoted
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value;
    } else if (value.startsWith('${') && value.endsWith('}')) {
        // It's a variable, keep as is
        value = value;
    } else {
        // Add quotes for literal values
        value = '"' + value + '"';
    }
    
    var code = Blockly.TestSageDSL.INDENT + 
               'Enter Field "' + fieldName + '" value: ' + value + '\n';
    return code;
};

// 3. Click Button Generator
Blockly.TestSageDSL['sap_click_button'] = function(block) {
    var buttonName = block.getFieldValue('BUTTON_NAME');
    var code = Blockly.TestSageDSL.INDENT + 
               'Click Button "' + buttonName + '"\n';
    return code;
};

// 4. Validate Message Generator
Blockly.TestSageDSL['sap_validate_message'] = function(block) {
    var operator = block.getFieldValue('OPERATOR');
    var expected = block.getFieldValue('EXPECTED');
    
    // Map dropdown values to DSL syntax
    var operatorMap = {
        'contains': 'contains:',
        'equals': 'equals:',
        'starts_with': 'starts_with:',
        'ends_with': 'ends_with:'
    };
    
    var code = Blockly.TestSageDSL.INDENT + 
               'Validate Message ' + operatorMap[operator] + ' "' + expected + '"\n';
    return code;
};

// 5. If Field Exists Generator
Blockly.TestSageDSL['sap_if_field_exists'] = function(block) {
    var fieldName = block.getFieldValue('FIELD_NAME');
    var thenActions = Blockly.TestSageDSL.statementToCode(block, 'THEN_ACTIONS');
    var elseActions = Blockly.TestSageDSL.statementToCode(block, 'ELSE_ACTIONS');
    
    var code = Blockly.TestSageDSL.INDENT + 'If FieldExists "' + fieldName + '"\n';
    
    if (thenActions) {
        // Increase indentation for nested actions
        var indentedThen = thenActions.split('\n').map(line => 
            line ? Blockly.TestSageDSL.INDENT + line : ''
        ).join('\n');
        code += indentedThen;
    }
    
    if (elseActions) {
        code += Blockly.TestSageDSL.INDENT + 'Else\n';
        var indentedElse = elseActions.split('\n').map(line => 
            line ? Blockly.TestSageDSL.INDENT + line : ''
        ).join('\n');
        code += indentedElse;
    }
    
    code += Blockly.TestSageDSL.INDENT + 'EndIf\n';
    
    return code;
};

// 6. Variable Generator
Blockly.TestSageDSL['sap_variable'] = function(block) {
    var varName = block.getFieldValue('VAR_NAME');
    return ['${' + varName + '}', Blockly.TestSageDSL.ORDER_ATOMIC];
};

// 7. Store Field Generator
Blockly.TestSageDSL['sap_store_field'] = function(block) {
    var fieldName = block.getFieldValue('FIELD_NAME');
    var varName = block.getFieldValue('VAR_NAME');
    
    var code = Blockly.TestSageDSL.INDENT + 
               'Store Field "' + fieldName + '" as: ${' + varName + '}\n';
    return code;
};

// 8. For Each Loop Generator
Blockly.TestSageDSL['sap_for_each'] = function(block) {
    var itemVar = block.getFieldValue('ITEM_VAR');
    var list = Blockly.TestSageDSL.valueToCode(block, 'LIST', 
        Blockly.TestSageDSL.ORDER_NONE) || '[]';
    var doActions = Blockly.TestSageDSL.statementToCode(block, 'DO');
    
    var code = Blockly.TestSageDSL.INDENT + 
               'For Each ${' + itemVar + '} in ' + list + '\n';
    
    if (doActions) {
        // Increase indentation for nested actions
        var indentedDo = doActions.split('\n').map(line => 
            line ? Blockly.TestSageDSL.INDENT + line : ''
        ).join('\n');
        code += indentedDo;
    }
    
    code += Blockly.TestSageDSL.INDENT + 'EndFor\n';
    
    return code;
};

// 9. SubFlow Generator
Blockly.TestSageDSL['sap_subflow'] = function(block) {
    var subflowName = block.getFieldValue('SUBFLOW_NAME');
    var parameters = Blockly.TestSageDSL.statementToCode(block, 'PARAMETERS');
    
    var code = Blockly.TestSageDSL.INDENT + 'SubFlow "' + subflowName + '"';
    
    if (parameters) {
        code += ' with:\n';
        // Format parameters with proper indentation
        var paramLines = parameters.trim().split('\n');
        paramLines.forEach(function(line) {
            if (line) {
                code += Blockly.TestSageDSL.INDENT + '  ' + line + '\n';
            }
        });
    } else {
        code += '\n';
    }
    
    return code;
};

// 10. Parameter Assignment Generator
Blockly.TestSageDSL['parameter_assignment'] = function(block) {
    var paramName = block.getFieldValue('PARAM_NAME');
    var paramValue = Blockly.TestSageDSL.valueToCode(block, 'PARAM_VALUE', 
        Blockly.TestSageDSL.ORDER_NONE) || '""';
    
    var code = paramName + ': ' + paramValue + '\n';
    return code;
};

// Add scrub_ function to handle orphan blocks
Blockly.TestSageDSL.scrub_ = function(block, code, opt_thisOnly) {
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = Blockly.TestSageDSL.blockToCode(nextBlock);
    return code + nextCode;
};