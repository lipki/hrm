

function Main () {

    /*-- réf --*/
    
    this.trash = '<li class="trash" style=""><span class="label symbole" style="">trash</span></li>';
    this.value = '<li class=""><button class="value">%s</button></li>';
    this.commands = {
        inbox:'<li class="instruction inbox" data-command="inbox"><span class="label"><span class="symbole">arrowright</span> inbox</span></li>',
        outbox:'<li class="instruction outbox" data-command="outbox"><span class="label">outbox <span class="symbole">arrowright</span></span></li>',
        copyfrom:'<li class="instruction copyfrom" data-command="copyfrom"><span class="label">copyfrom</span><span class="ram">%s</span></li>',
        copyto:'<li class="instruction copyto" data-command="copyto"><span class="label">copyto</span><span class="ram">%s</span></li>',
        add:'<li class="instruction add" data-command="add"><span class="label">add</span><span class="ram">%s</span></li>',
        sub:'<li class="instruction sub" data-command="sub"><span class="label">sub</span><span class="ram">%s</span></li>',
        jump:'<li class="instruction jump" data-command="jump"><span class="label">jump</span></li>'
    };
    this.bonshomme = {
        start:{bottom: "35em", left: "6em"},
        inbox:{bottom: "25em", left: "8em"},
        outbox:{bottom: "25em", left: "34em"}
    }
    
    /*-- init --*/
    
    this.program = [];
    this.playhead = -1;
    this.exerciseFirstAct = false;
    this.data = null;
    
    var mi = this;
    
    $( "#sortable" ).sortable();
    $( "#draggable" ).droppable({
        drop: function( event, ui ) {
            ui.draggable.remove();
            mi.updateCommands(-1);
        }
    });
    $( "ul, li" ).disableSelection();
    
    $('#play button').click(function(){ mi.frame() });
    $('#stop button').click(function(){ mi.programReset() });
    
    this.updateCommands = function( add ) {
        
        // line number
        
        var nb = $('#sortable').children().length + (isNaN(add) ? 0 : add);
        $('#nb').empty();
        for(var i = 1; i <= nb; i++)
            $('#nb').append('<li><span class="nb">'+(('00'+String(i)).substring(String(i).length))+'</span></li>');
        
        if( !this.exerciseFirstAct )
            $('#player').removeClass('hide');
        this.exerciseFirstAct = true;
        
        this.programReset();
        
    }
    
    /*-- exercise init --*/
    
    $.getJSON( "exercises/exercise1.json", function( data ) { mi.exerciseReset( data ) });
    
    this.exerciseReset = function( data ) {
        
        this.data = data || this.data;
        var mi = this;
        
        //title
        $('#menu h3').html(data.name);
        $('#pitch').html(data.description);
        
        $('#draggable').empty();
        for( var c in data.commands ) {
            var command = data.commands[c];
            $('#draggable').append(commands[command]);
        }
        $('#draggable').append(trash);
        
        $( ".instruction" ).draggable({
            connectToSortable: "#sortable",
            helper: "clone",
            revert: "invalid",
            scroll: false,
            stop: function(){ mi.updateCommands(0) }
        });
        $( "ul, li" ).disableSelection();
        
        programReset();
        
    };
    
    this.programReset = function() {
        
        if( !exerciseFirstAct || program.length > 0 ) {
            this.program = [];
            this.playhead = -1;
            
            $('#inbox').empty();
            for( c in data.samples ) {
                var val = $(value.replace("%s", data.samples[c]));
                var bval = $('#inbox').append(val);
                val.css({transform:'rotate('+(Math.random()*5-2.5)+'deg)'})
                if(c == 0) val.addClass('out');
            }
            $('#inbox').animate( {'b-p':'-20em'},{ duration: 2000,
                step: function( now, fx ) { $(fx.elem).css('background-position','0 '+now+'em') }} );
            setTimeout(function(){ $('#inbox li').removeClass('out'); }, 1);
            $('#inbox').css('background-position','');
            
            $('#outbox').empty();
            $('.bonshomme .box').empty();
            
            $('#play').addClass('active');
            $('#stop').removeClass('active');
            $('#forward').addClass('active');
            $('#reply').removeClass('active');
        }
        
    }
    
    this.frame = function () {
        
        this.playhead ++;
        
        if( this.program.length == 0 ) {
            this.program = $('#sortable').children();
            $('#play').removeClass('active');
            $('#forward').removeClass('active');
            $('#stop').addClass('active');
        }
        
        /*if( playhead > 0 )
            $('#reply').addClass('active');
        if( playhead == 0 )
            $('#reply').removeClass('active');*/

        if( this.program[this.playhead] != undefined ) {
            var command = this.program[this.playhead].getAttribute('data-command');
            this[command+'Command']();
        } else {
            $('.bonshomme').animate(
                this.bonshomme.start,
                500,
                function() {
                    console.log('end');
                }
            );
        }
        
    }
    
    this.inboxCommand = function () {
        console.log('go in in');
        $('.bonshomme').animate(
            this.bonshomme.inbox,
            500,
            function() {
                $('.bonshomme .box').empty();
                $('.bonshomme .box').append($('#inbox li:first-child'));
                frame();
            }
        );
    }

    this.outboxCommand = function () {
        console.log('go in out');
        $('.bonshomme').animate(
            this.bonshomme.outbox,
            500,
            function() {
                $('#outbox').prepend($('.bonshomme .box li:first-child'));
                $('.bonshomme .box').empty();
                frame();
            }
        );
    }
}

$(function() {Main()});

/*


*/
/*-- exercise 1 --*/
/*
$(function() {
    
    Main();
    
    
    
    $.getJSON( "exercises/exercise1.json", function( data ) {
        
        
        //title
        $('#menu h3').html(data.name);
        $('#pitch').html(data.description);
        
        for( var c in data.commands ) {
            var command = data.commands[c];
            $('#draggable').append(commands[command]);
        }
        $('#draggable').append(trash);
        
        reset(start, program, data);
        
        
        /*-- UI --*/
/*
        $( "#sortable" ).sortable();
        $( ".instruction" ).draggable({
            connectToSortable: "#sortable",
            helper: "clone",
            revert: "invalid",
            scroll: false,
            stop: function() {
                updateLineNumber(0);
                if(!start) {
                    $('#player').removeClass('hide');
                    $('#play').addClass('active');
                    $('#forward').addClass('active');
                }
                start = true;
                reset(start, program, data);
            }
        });
        $( "#draggable" ).droppable({
            drop: function( event, ui ) {
                ui.draggable.remove();
                updateLineNumber(-1);
                reset(start, program, data);
            }
        });
        $( "ul, li" ).disableSelection();

    });
    
});
*/
