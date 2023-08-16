import { LightningElement, track } from 'lwc';

export default class DebtDatatable extends LightningElement {
    @track tableData = [];
    total = 0.00;

    // Total number of rows in table
    get totalRows() {
        return this.tableData.length;
    }

    // Total number of checked rows in table
    get checkedRows() {
        let rowNum = 0;
        this.tableData.forEach(element => {
            if(element.isChecked) {
                rowNum++;
            }
        });
        return rowNum;
    }

    get renderRemove(){
        return this.checkedRows > 0 ? true : false;
    }

    connectedCallback() {

        // Get the JSON data
        this.getTableData();
    }

    getTableData() {

        // Use JS fetch to get the JSON data
        const calloutURI = 'https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json';
        fetch(calloutURI, {
            method: "GET"
        }).then((response) => response.json())
            .then(repos => {
                this.tableData = repos;

                // Calculate sum of balance amount
                this.calculateTotal();
            });
    }

    calculateTotal() {

        // Use filter to add the balance and store the sum
        let sum = this.tableData.reduce((accumulator, object) => {
            return accumulator + +object.balance;
        }, 0);
        this.total = sum;
    }

    handleEdit(event) {

        // Mark the 'isEdit' key as true on JSON row
        let indexKey = event.currentTarget.dataset.id;
        let index = this.tableData.findIndex(item => item.id == indexKey);
        this.tableData[index].isEdit = true;
    }

    handleRowCheck(event) {
        let indexKey = event.currentTarget.dataset.id;
        let index = this.tableData.findIndex(item => item.id == indexKey);
        this.tableData[index].isChecked = event.target.checked;
    }

    handleAllRowCheck(event) {

        // Mark checked value in JSON
        this.tableData.forEach(element => {
            element.isChecked = event.target.checked;
        });

        // Mark checked value in UI
        let secondClasses = this.template.querySelectorAll(".singleCheckbox");
        secondClasses.forEach(element => {
            element.checked = event.target.checked;
        });
    }

    handleAddDebt(event) {
        let lastId = this.getNewKey();
        this.tableData.push(
            {
                'creditorName' : '',
                'firstName' : '',
                'lastName' : '',
                'minPaymentPercentage' : '',
                'balance' : '',
                'isEdit' : true,
                'id' : lastId
            }
        );
    }

    getNewKey() {

        // Generate new id for newly added row
        let keyGenerated = false;
        let lastId = this.tableData.length + 1;

        while(!keyGenerated) {
            let index = this.tableData.findIndex(item => item.id == lastId);
            console.log(index);
            if(index == -1) {
                break; 
            } else {
                lastId++;
            }
        }
        return lastId;
    }

    handleRemove(event) {
        this.tableData = this.tableData.filter(function( obj ) {
            return !obj.isChecked;
        });
        this.calculateTotal();
    }

    handleRowSave(event) {
        let indexKey = event.currentTarget.dataset.id;
        let index = this.tableData.findIndex(item => item.id == indexKey);
        let isValid = this.validateInputs(event, index);
        console.log(isValid);
        if(isValid) {
            this.tableData[index].isEdit = false;
            this.calculateTotal();
        }
    }

    validateInputs(event) {
        let isValid = true;
        let identifier = event.currentTarget.dataset.id;
        try{
            let inputFields = this.template.querySelectorAll(`[data-id="${identifier}"]`);
            inputFields.forEach(inputField => {
                if(!inputField.checkValidity()) {
                    isValid = false;
                }
            });
        } catch(err) {
            console.log(err);
        }
        return isValid;
    }

    handleInputChange(event) {
        let indexKey = event.currentTarget.dataset.id;
        let index = this.tableData.findIndex(item => item.id == indexKey);
        this.tableData[index][event.currentTarget.dataset.name] = event.target.value;
    }
}