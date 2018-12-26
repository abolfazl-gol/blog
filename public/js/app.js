$(document).ready(function () {
    $("time.timeago").timeago();

    $('#like-btn').click(function(){
        var url = window.location + '/like'
        $.post(url, function(data, status){
            if(status == "success"){
                $('#like-btn').text(data.likes)
            }
        })
    })

});

