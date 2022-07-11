class CalcController {

    constructor(){

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();

    }

    //método p/ pegar número de outro lugar e colar no display da calculadora
    pasteFromClipboard(){

        document.addEventListener('paste', e=>{

           let text =  e.clipboardData.getData('Text');

           this.displayCalc = parseFloat(text);

        });

    }

    //método para copiar para área de transferência
    copyToClipboard(){

        //criando elemento na tela dinamicamente
        let input = document.createElement('input');

        input.value = this.displayCalc;
        
        //inserindo o elemento input dentro do body, pois assim permite selecionar e copiar
        //método nativo "appendChild" para ser filho do body
        document.body.appendChild(input);

        //selecionando o conteúdo
        input.select();

        //pegar a informação selecionada e copiar para o SO
        document.execCommand("Copy");

        //assim que copiar, remover da tela
        input.remove();

    }

    //método para inicializar a calculadora
    initialize(){

        this.setDisplayDateTime();

        setInterval(()=>{

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay(); //inicializar o display com o 0
        this.pasteFromClipboard();


        document.querySelectorAll('.btn-ac').forEach(btn =>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio(); //controlar para saber se o áudio está ligado
            });
        });
    }


    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;

    }

    //método para tocar o som
    playAudio(){
        
        if (this._audioOnOff) {

            this._audio.currentTime = 0
            this._audio.play();
        }

    }

    //método para inicializar os eventos de teclado
    initKeyBoard(){

        document.addEventListener('keyup', e=> {
             
            this.playAudio();

            switch (e.key) { //criando switch com base no valor digitado

                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backspace':
                    this.clearEntry();
                    break;
    
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
    
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case '.':
                case ',':
                    this.addDot();
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;   

                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }

    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearAll(){
        this._operation = []; //zerando o array
        this._lastNumber = ''; //definindo o último nº como vazio
        this._lastOperator = ''; //definindo o último operador como vazio
        this.setLastNumberToDisplay(); //mostrando no display
    }

    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    getLastOperation(){
        return this._operation[this._operation.length-1];
    
    }

    isOperator(value){ 
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {
            
            this.calc();
        
        }
    }

    getResult() {
        try{ //tente fazer
        return eval(this._operation.join(""));;
        } catch(e){ //se não conseguir o try, execute o catch  
            setTimeout(()=>{
                this.setError();
            }, 1);
        }
    }

    calc() {

        let last = '';

        this._lastOperator = this.getLastItem(); //guardar o resultado do último operador

        if (this._operation.length < 3) {

            let firstItem = this._operation[0]; //primeiro número
            this._operation = [firstItem, this._lastOperator, this._lastNumber]; 
        }

        if (this._operation.length > 3) { //se passar de 3 itens
           
            let last = this._operation.pop(); //tirar o último e guardar na variável last
            this._lastNumber = this.getResult(); //guardar o resultado do último número 
        
        } else if (this._operation.length == 3) {
    
            this._lastNumber = this.getLastItem(false); //guardar o último número

        }

        let result = this.getResult();

        if (last == '%') { //caso o último for porcento
             
            result  /= 100; //realizar o cálculo

            this._operation = [result];

        } else {
        
            this._operation = [result];

            if (last) this._operation.push(last);

        }

        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true){

        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

             if(this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if (!lastItem) { //se não encontrar o último item
            
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber; //verificando condição com operador ternário

        }

        return lastItem;
    }

    setLastNumberToDisplay(){
         
        let lastNumber = this.getLastItem(false); //quando o último for número

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    //adicionando uma nova operação
    addOperation(value){

        if (isNaN(this.getLastOperation())) { //condição para caso não seja um número

            if (this.isOperator(value)) {

                this.setLastOperation(value);

            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
                
        } else { //se for número

            if (this.isOperator(value)){

                this.pushOperation(value);

            } else {
                
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            }

        }

    }

    setError(){
        this.displayCalc = "Error";
    }
    
    addDot(){

       let lastOperation = this.getLastOperation(); 

       if (typeof lastOperation == 'string' && lastOperation.split('').indexOf('.') > -1) return; //verificando se a operação existe e se já possui um ponto

       if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.'); //adicionar um novo item na operação
       } else {
            this.setLastOperation(lastOperation.toString() + '.');
       }

       this.setLastNumberToDisplay(); //atualizar e mostar na tela o que está acontecendo

    }

    execBtn(value){

        this.playAudio(); //independente do botão, o áudio irá tocar

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            
            default:
                this.setError();
                break;    
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn,"click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);
        
        });

        this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
            btn.style.cursor = "pointer";
        });

        });
    }

    //formatando data
    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        return this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        //definindo valor máximo para o display
        if (value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(valor) {
        this._currentDate = valor;
    }

}