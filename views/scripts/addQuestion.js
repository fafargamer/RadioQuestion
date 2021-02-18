$('.submitBtn').on('click', function(){

    $(':radio:checked').each(function(){
        alert($(this).val());
     });

})