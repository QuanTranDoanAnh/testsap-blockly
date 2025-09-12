// Parser to convert DSL back to Blockly blocks
class TestSageDSLParser {
    constructor(workspace) {
        this.workspace = workspace;
        this.currentY = 50;
        this.blockStack = [];
    }
    
    // Parse DSL text and create blocks
    parseDSL(dslText) {
        this.workspace.clear();
        const lines = dslText.split('\n');
        let currentBlock = null;
        let lastBlock = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const block = this.parseLine(line, lines, i);
            if (block) {
                if (!currentBlock) {
                    currentBlock = block;
                    this.positionBlock(block);
                } else if (this.shouldNest(line)) {
                    this.nestBlock(currentBlock, block);
                } else {
                    this.chainBlock(lastBlock || currentBlock, block);
                    lastBlock = block;
                }
            }
        }
        
        this.workspace.render();
    }
    
    // Parse a single line of DSL
    parseLine(line, allLines, index) {
        // Transaction block
        if (line.startsWith('Begin Transaction')) {
            const tcode = this.extractQuoted(line);
            return this.createBlock('sap_transaction', {
                'TCODE': tcode
            });
        }
        
        // Enter Field action
        if (line.startsWith('Enter Field')) {
            const parts = line.match(/Enter Field "([^"]+)" value: (.+)/);
            if (parts) {
                const block = this.createBlock('sap_enter_field', {
                    'FIELD_NAME': parts[1]
                });
                
                // Handle value - could be variable or literal
                const value = parts[2].trim();
                if (value.startsWith('${') && value.endsWith('}')) {
                    // It's a variable
                    const varBlock = this.createBlock('sap_variable', {
                        'VAR_NAME': value.slice(2, -1)
                    });
                    this.connectValue(block, 'VALUE', varBlock);
                }
                
                return block;
            }
        }
        
        // Click Button action
        if (line.startsWith('Click Button')) {
            const buttonName = this.extractQuoted(line);
            return this.createBlock('sap_click_button', {
                'BUTTON_NAME': buttonName
            });
        }
        
        // Validate Message
        if (line.startsWith('Validate Message')) {
            const parts = line.match(/Validate Message (\w+): "([^"]+)"/);
            if (parts) {
                return this.createBlock('sap_validate_message', {
                    'OPERATOR': parts[1].replace(':', ''),
                    'EXPECTED': parts[2]
                });
            }
        }
        
        // If statement
        if (line.startsWith('If FieldExists')) {
            const fieldName = this.extractQuoted(line);
            const ifBlock = this.createBlock('sap_if_field_exists', {
                'FIELD_NAME': fieldName
            });
            
            // Parse the body of the if statement
            const bodyBlocks = this.parseIfBody(allLines, index + 1);
            if (bodyBlocks.then) {
                this.connectStatement(ifBlock, 'THEN_ACTIONS', bodyBlocks.then);
            }
            if (bodyBlocks.else) {
                this.connectStatement(ifBlock, 'ELSE_ACTIONS', bodyBlocks.else);
            }
            
            return ifBlock;
        }
        
        // Store Field
        if (line.startsWith('Store Field')) {
            const parts = line.match(/Store Field "([^"]+)" as: \$\{([^}]+)\}/);
            if (parts) {
                return this.createBlock('sap_store_field', {
                    'FIELD_NAME': parts[1],
                    'VAR_NAME': parts[2]
                });
            }
        }
        
        // SubFlow
        if (line.startsWith('SubFlow')) {
            const parts = line.match(/SubFlow "([^"]+)"/);
            if (parts) {
                const subflowBlock = this.createBlock('sap_subflow', {
                    'SUBFLOW_NAME': parts[1]
                });
                
                // Parse parameters if "with:" is present
                if (line.includes('with:')) {
                    const params = this.parseSubflowParams(allLines, index + 1);
                    if (params) {
                        this.connectStatement(subflowBlock, 'PARAMETERS', params);
                    }
                }
                
                return subflowBlock;
            }
        }
        
        return null;
    }
    
    // Helper to create a block
    createBlock(type, fields) {
        const block = this.workspace.newBlock(type);
        
        for (const [fieldName, value] of Object.entries(fields || {})) {
            block.setFieldValue(value, fieldName);
        }
        
        block.initSvg();
        return block;
    }
    
    // Helper to extract quoted text
    extractQuoted(text) {
        const match = text.match(/"([^"]+)"/);
        return match ? match[1] : '';
    }
    
    // Connect a value block to an input
    connectValue(parentBlock, inputName, childBlock) {
        const input = parentBlock.getInput(inputName);
        if (input && input.connection) {
            input.connection.connect(childBlock.outputConnection);
        }
    }
    
    // Connect a statement block
    connectStatement(parentBlock, inputName, childBlock) {
        const input = parentBlock.getInput(inputName);
        if (input && input.connection) {
            input.connection.connect(childBlock.previousConnection);
        }
    }
    
    // Chain blocks together
    chainBlock(previousBlock, nextBlock) {
        if (previousBlock.nextConnection && nextBlock.previousConnection) {
            previousBlock.nextConnection.connect(nextBlock.previousConnection);
        }
    }
    
    // Position block in workspace
    positionBlock(block) {
        block.moveBy(50, this.currentY);
        block.initSvg();
        block.render();
        this.currentY += 100;
    }
    
    // Parse if statement body
    parseIfBody(lines, startIndex) {
        const result = { then: null, else: null };
        let currentSection = 'then';
        let blocks = [];
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === 'Else') {
                // Save then blocks and switch to else
                if (blocks.length > 0) {
                    result.then = this.chainBlockList(blocks);
                    blocks = [];
                }
                currentSection = 'else';
                continue;
            }
            
            if (line === 'EndIf') {
                // Save current section blocks and exit
                if (blocks.length > 0) {
                    result[currentSection] = this.chainBlockList(blocks);
                }
                break;
            }
            
            // Parse the line and add to current section
            const block = this.parseLine(line, lines, i);
            if (block) {
                blocks.push(block);
            }
        }
        
        return result;
    }
    
    // Chain a list of blocks together
    chainBlockList(blocks) {
        if (blocks.length === 0) return null;
        
        for (let i = 0; i < blocks.length - 1; i++) {
            this.chainBlock(blocks[i], blocks[i + 1]);
        }
        
        return blocks[0];
    }
    
    // Parse subflow parameters
    parseSubflowParams(lines, startIndex) {
        let paramBlocks = [];
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if we've reached the end of parameters
            if (!line.includes(':') || !line.startsWith(' ')) {
                break;
            }
            
            const parts = line.match(/(\w+):\s*(.+)/);
            if (parts) {
                const paramBlock = this.createBlock('parameter_assignment', {
                    'PARAM_NAME': parts[1]
                });
                
                // Handle parameter value
                const value = parts[2].trim();
                if (value.startsWith('${') && value.endsWith('}')) {
                    const varBlock = this.createBlock('sap_variable', {
                        'VAR_NAME': value.slice(2, -1)
                    });
                    this.connectValue(paramBlock, 'PARAM_VALUE', varBlock);
                }
                
                paramBlocks.push(paramBlock);
            }
        }
        
        return this.chainBlockList(paramBlocks);
    }
}