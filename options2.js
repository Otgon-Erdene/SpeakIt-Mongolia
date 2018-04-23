let bgPage = chrome.extension.getBackgroundPage();

function get(name){
    let value = localStorage.getItem(name);
    if(value == 'false') 
        return false; 
    else  
        return value;
}

function set(name,value){
    localStorage.setItem(name,value);
}

// function renderMySelect(){

//     let setElm = $('#voicetype');
//     setElm.empty();
//     for(let i in myset_select){
//         //setElm.append('<label>' + myset_select_names[i] + '</label>');
//         let selectElm = $('<select data-id="' + i + '"></select>');
//         setElm.append(selectElm);
//         selectElm.unbind().change(function(e){

//             let val = e.target.value;
//             let idIn = $(this).attr('data-id');
//             set(idIn,val);
            
//         });
//             let params = myset_select[i];
//             for(let j in params){
//               let elm = $('<option></option>');
//               if(params[j][1]){
//                 elm.text(params[j][1]);
//             }else{
//                 elm.text(params[j][0]);
//             }
//             elm.attr('value',params[j][0]);
//             if(params[j][0] == get('voice')){
//                 elm.attr('selected','selected');
//             }
//             selectElm.append(elm);
//             }
//         setElm.append('<br />');
//     }

// }

function renderMySelect1(){

    let selectElm = $('#voicetype_id');
    selectElm.unbind().change(function(e){

        let val = e.target.value;
        let idIn = $(this).attr('data-id');
        set(idIn,val);
        
    });


}

// INIT
$(document).ready(function(){

    $('#appName').html(chrome.app.getDetails().name);

    renderMySelect1();
    $('#urlButton').click(function(){
        let pageURL = $('#urlField').val();
        bgPage.getContent(pageURL);
    });
    
    $('select').formSelect();
    
});

let myset_select = {
    voice: [['altanbagana','Хоолой 1'],['tsevelmaa','Хоолой 2'], ['oyunaa','Хоолой 3']]
};

let myset_select_names = {
    voice: 'Voice Type'
};