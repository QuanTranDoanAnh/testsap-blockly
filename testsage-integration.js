// testsage-integration.js
class TestSageBlocklyIntegration {
    constructor(containerId) {
        this.containerId = containerId;
        this.workspace = null;
        this.parser = null;
        this.isDirty = false;
    }
    
    // Initialize the Blockly editor
    initialize() {
        this.workspace = Blockly.inject(this.containerId, {
            toolbox: this.getToolboxConfig(),
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
                minScale: 0.3
            },
            trashcan: true
        });
        
        this.parser = new TestSageDSLParser(this.workspace);
        
        // Set up change listeners
        this.workspace.addChangeListener((event) => {
            if (event.type !== Blockly.Events.UI) {
                this.isDirty = true;
                this.onBlocksChanged();
            }
        });
        
        return this;
    }
    
    // Get TestSage JSON representation
    toTestSageJSON() {
        const blocks = Blockly.serialization.workspaces.save(this.workspace);
        const dsl = this.toDSL();
        
        return {
            version: "1.0",
            type: "test_case",
            visual_representation: blocks,
            dsl_representation: dsl,
            metadata: {
                created_at: new Date().toISOString(),
                last_modified: new Date().toISOString(),
                author: "current_user" // Get from session
            },
            steps: this.extractSteps()
        };
    }
    
    // Load from TestSage JSON
    fromTestSageJSON(json) {
        if (json.visual_representation) {
            // Load from visual representation
            this.workspace.clear();
            Blockly.serialization.workspaces.load(
                json.visual_representation, 
                this.workspace
            );
        } else if (json.dsl_representation) {
            // Parse from DSL
            this.fromDSL(json.dsl_representation);
        } else if (json.steps) {
            // Build from steps array
            this.buildFromSteps(json.steps);
        }
        
        this.isDirty = false;
    }
    
    // Convert to DSL
    toDSL() {
        return Blockly.TestSageDSL.workspaceToCode(this.workspace);
    }
    
    // Convert from DSL
    fromDSL(dslText) {
        this.parser.parseDSL(dslText);
        this.isDirty = false;
    }
    
    // Convert to Robot Framework
    toRobotFramework() {
        // This would use a different generator
        // For now, we'll create a basic mapping
        const dsl = this.toDSL();
        return this.dslToRobot(dsl);
    }
    
    // Basic DSL to Robot Framework converter
    dslToRobot(dsl) {
        let robot = '*** Settings ***\n';
        robot += 'Library    SAPGuiLibrary\n\n';
        robot += '*** Test Cases ***\n';
        robot += 'Test Case Name\n';
        
        // Convert DSL lines to Robot Framework
        const lines = dsl.split('\n');
        for (const line of lines) {
            const robotLine = this.convertDSLLineToRobot(line);
            if (robotLine) {
                robot += '    ' + robotLine + '\n';
            }
        }
        
        return robot;
    }
    
    // Convert individual DSL line to Robot
    convertDSLLineToRobot(line) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Begin Transaction')) {
            const tcode = this.extractQuoted(trimmed);
            return `Start Transaction    ${tcode}`;
        }
        
        if (trimmed.startsWith('Enter Field')) {
            const parts = trimmed.match(/Enter Field "([^"]+)" value: (.+)/);
            if (parts) {
                return `Input Text    ${parts[1]}    ${parts[2]}`;
            }
        }
        
        if (trimmed.startsWith('Click Button')) {
            const button = this.extractQuoted(trimmed);
            return `Click Element    ${button}`;
        }
        
        if (trimmed.startsWith('Validate Message')) {
            const parts = trimmed.match(/Validate Message \w+: "([^"]+)"/);
            if (parts) {
                return `Page Should Contain    ${parts[1]}`;
            }
        }
        
        return null;
    }
    
    // Extract structured steps for grid view
    extractSteps() {
        const steps = [];
        const blocks = this.workspace.getTopBlocks(false);
        
        for (const block of blocks) {
            this.extractStepsFromBlock(block, steps);
        }
        
        return steps;
    }
    
    // Recursively extract steps from blocks
    extractStepsFromBlock(block, steps, indent = 0) {
        const step = {
            id: block.id,
            type: block.type,
            action: this.getActionFromBlock(block),
            target: this.getTargetFromBlock(block),
            value: this.getValueFromBlock(block),
            indent: indent
        };
        
        steps.push(step);
        
        // Process child blocks
        const children = block.getChildren(false);
        for (const child of children) {
            this.extractStepsFromBlock(child, steps, indent);
        }
        
        // Process next block
        const next = block.getNextBlock();
        if (next) {
            this.extractStepsFromBlock(next, steps, indent);
        }
    }
    
    // Get action description from block
    getActionFromBlock(block) {
        const typeMap = {
            'sap_transaction': 'Start Transaction',
            'sap_enter_field': 'Enter Field',
            'sap_click_button': 'Click Button',
            'sap_validate_message': 'Validate Message',
            'sap_if_field_exists': 'If Field Exists',
            'sap_store_field': 'Store Field',
            'sap_subflow': 'Call SubFlow'
        };
        
        return typeMap[block.type] || block.type;
    }
    
    // Get target element from block
    getTargetFromBlock(block) {
        switch (block.type) {
            case 'sap_transaction':
                return block.getFieldValue('TCODE');
            case 'sap_enter_field':
                return block.getFieldValue('FIELD_NAME');
            case 'sap_click_button':
                return block.getFieldValue('BUTTON_NAME');
            case 'sap_if_field_exists':
                return block.getFieldValue('FIELD_NAME');
            case 'sap_store_field':
                return block.getFieldValue('FIELD_NAME');
            case 'sap_subflow':
                return block.getFieldValue('SUBFLOW_NAME');
            default:
                return '';
        }
    }
    
    // Get value from block
    getValueFromBlock(block) {
        switch (block.type) {
            case 'sap_enter_field':
                const valueBlock = block.getInputTargetBlock('VALUE');
                if (valueBlock && valueBlock.type === 'sap_variable') {
                    return '${' + valueBlock.getFieldValue('VAR_NAME') + '}';
                }
                return '';
            case 'sap_validate_message':
                return block.getFieldValue('EXPECTED');
            case 'sap_store_field':
                return '${' + block.getFieldValue('VAR_NAME') + '}';
            default:
                return '';
        }
    }
    
    // Build blocks from steps array
    buildFromSteps(steps) {
        this.workspace.clear();
        let previousBlock = null;
        let blockMap = {};
        
        for (const step of steps) {
            const block = this.createBlockFromStep(step);
            if (block) {
                blockMap[step.id] = block;
                
                if (!previousBlock) {
                    // First block - position it
                    block.moveBy(50, 50);
                } else if (step.indent === 0) {
                    // Chain to previous block
                    if (previousBlock.nextConnection) {
                        previousBlock.nextConnection.connect(
                            block.previousConnection
                        );
                    }
                }
                
                if (step.indent === 0) {
                    previousBlock = block;
                }
                
                block.initSvg();
                block.render();
            }
        }
        
        this.workspace.render();
    }
    
    // Create block from step data
    createBlockFromStep(step) {
        const typeMap = {
            'Start Transaction': 'sap_transaction',
            'Enter Field': 'sap_enter_field',
            'Click Button': 'sap_click_button',
            'Validate Message': 'sap_validate_message',
            'If Field Exists': 'sap_if_field_exists',
            'Store Field': 'sap_store_field',
            'Call SubFlow': 'sap_subflow'
        };
        
        const blockType = typeMap[step.action] || step.type;
        const block = this.workspace.newBlock(blockType);
        
        // Set field values based on step data
        this.setBlockFieldsFromStep(block, step);
        
        return block;
    }
    
    // Set block fields from step
    setBlockFieldsFromStep(block, step) {
        if (step.target) {
            // Set the appropriate field based on block type
            switch (block.type) {
                case 'sap_transaction':
                    block.setFieldValue(step.target, 'TCODE');
                    break;
                case 'sap_enter_field':
                    block.setFieldValue(step.target, 'FIELD_NAME');
                    break;
                case 'sap_click_button':
                    block.setFieldValue(step.target, 'BUTTON_NAME');
                    break;
                // ... other cases
            }
        }
        
        if (step.value) {
            // Handle value setting
            if (step.value.startsWith('${') && step.value.endsWith('}')) {
                // Create variable block
                const varName = step.value.slice(2, -1);
                const varBlock = this.workspace.newBlock('sap_variable');
                varBlock.setFieldValue(varName, 'VAR_NAME');
                varBlock.initSvg();
                
                // Connect to appropriate input
                const input = block.getInput('VALUE');
                if (input && input.connection) {
                    input.connection.connect(varBlock.outputConnection);
                }
            }
        }
    }
    
    // Event handler for block changes
    onBlocksChanged() {
        // Emit event to parent application
        if (window.TestSageEventBus) {
            window.TestSageEventBus.emit('blocks-changed', {
                dsl: this.toDSL(),
                json: this.toTestSageJSON(),
                isDirty: this.isDirty
            });
        }
    }
    
    // Validation
    validate() {
        const errors = [];
        const warnings = [];
        
        // Check for orphaned blocks
        const allBlocks = this.workspace.getAllBlocks(false);
        for (const block of allBlocks) {
            if (!block.getRootBlock().previousConnection && 
                block.type !== 'sap_transaction') {
                warnings.push({
                    blockId: block.id,
                    message: 'Block is not connected to a transaction'
                });
            }
            
            // Check required fields
            const fields = block.inputList.filter(input => 
                input.type === Blockly.INPUT_VALUE && !input.connection.targetBlock()
            );
            
            for (const field of fields) {
                if (field.name === 'VALUE') {
                    errors.push({
                        blockId: block.id,
                        message: `Missing value for ${field.name}`
                    });
                }
            }
        }
        
        return { errors, warnings };
    }
    
    // Helper to extract quoted text
    extractQuoted(text) {
        const match = text.match(/"([^"]+)"/);
        return match ? match[1] : '';
    }
    
    // Get toolbox configuration
    getToolboxConfig() {
        // Return the toolbox XML string from earlier
        return toolboxXML;
    }
}

// Export for use in TestSage application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSageBlocklyIntegration;
}