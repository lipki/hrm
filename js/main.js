

var main = function Main (name) {
    
    this.constructor.name = name;
    this.name = name;

    /*-- réf --*/
    
    this.trash = '<li class="trash" style=""><span class="label symbole" style="">trash</span></li>';
    this.commands = {
        inbox:'<li class="instruction inbox" data-command="inbox"><span class="label"><span class="symbole">arrowright</span> inbox</span></li>',
        outbox:'<li class="instruction outbox" data-command="outbox"><span class="label">outbox <span class="symbole">arrowright</span></span></li>',
        copyfrom:'<li class="instruction copyfrom" data-command="copyfrom"><span class="label">copyfrom</span><span class="ram">%s</span></li>',
        copyto:'<li class="instruction copyto" data-command="copyto"><span class="label">copyto</span><span class="ram">%s</span></li>',
        add:'<li class="instruction add" data-command="add"><span class="label">add</span><span class="ram">%s</span></li>',
        sub:'<li class="instruction sub" data-command="sub"><span class="label">sub</span><span class="ram">%s</span></li>',
        jump:'<li class="instruction jump" data-command="jump"><button class="fleche"></button><span class="label">jump</span></li>',
        jumphere:'<li class="instruction jumphere" data-command="jumphere"><span class="label">&nbsp; &nbsp; &nbsp; &nbsp; </span></li>',
        end:'<li class="instruction end" data-command="end"><span class="label"><span class="symbole">out</span> end</span></li>',
        start:'<li class="instruction start" data-command="start"><span class="label">start <span class="symbole">in</span></span></li>'
    };
    this.bonshomme = {
        start:{bottom: "77vh", left: "8vw"},
        inbox:{bottom: $('#inbox').css('height'), left: "11vw"},
        outbox:{bottom: $('#inbox').css('height'), left: "65vw"}
    }
    
    this.message = {
        errorToShort:"<p>Pas assez d'éléments dans l'INBOX !<br/>La gestion attend un total de %s objets, et non de %d !</p>",
        errorToLong:"<p>Trop d'éléments dans l'INBOX !<br/>La gestion attend un total de %s objets, et non de %d !</p>",
        errorBad:"<p>Le résultat n'est pas conforme aux exigences de la direction !</p>",
        next:"<p>Bravo, c'est parfait !<br/>Rendez-vous au prochain épisode.</p>"
    }
    
    /*-- init --*/
    
    this.program = [];
    this.playhead = -1;
    this.exerciseFirstAct = false;
    this.data = null;
    this.inboxConveyor = new Conveyor('in', $('#inbox'));
    this.outboxConveyor = new Conveyor('out', $('#outbox'));
    this.exec = 'none';
    
    var mi = this;
    
    $( "#sortable" ).sortable({
        cancel: ".end, .start",
        placeholder: "ui-state-highlight",
        stop: function(){ mi.updateCommands(0) }
    });
    $( "#draggable" ).droppable({
        drop: function( event, ui ) {
            if( ui.draggable.parent('ul').attr('id') == 'sortable' ) {
                ui.draggable.remove();
                mi.updateCommands(-1);
            }
        }
    });
    $( "ul, li" ).disableSelection();
    
    $('#play button').click(function(){ if($(this).parent('li').hasClass('active')) { mi.exec = 'run'; mi.frame() } });
    $('#stop button').click(function(){ if($(this).parent('li').hasClass('active')) mi.exec = 'stop'; });
    
    /*-- exercise init --*/
    
    $.getJSON( "exercises/exercise2.json", function( data ) { mi.exerciseReset( data ) });
    
    this.exerciseReset = function( data ) {
        
        this.data = data || this.data;
        var mi = this;
        
        //title
        $('#menu h3').html(data.name);
        $('#pitch').html(data.description);
        
        $('#draggable').empty();
        for( var c in data.commands ) {
            var command = data.commands[c];
            $('#draggable').append(this.commands[command]);
        }
        $('#draggable').append(this.trash);
        
        $('#sortable').empty();
        $('#sortable').append(this.commands['start']);
        for( var c in data.program ) {
            var command = data.program[c];
            $('#sortable').append(this.commands[command]);
        }
        $('#sortable').append(this.commands['end']);
        
        $( "#draggable .instruction" ).draggable({
            connectToSortable: "#sortable",
            helper: "clone",
            revert: "invalid",
            scroll: false,
            stop: function(event, ui ){
                if( $(this).attr('data-command') == 'jump' ) {
                    var id = Math.floor(Math.random()*1000);
                    var here = $(mi.commands['jumphere']);
                    $(this).attr('data-jump', id);
                    here.attr('data-jump', id);
                    $('#sortable').append(here);
                }
                
                mi.updateCommands(0)
            }
        });
        $( "ul, li" ).disableSelection();
        
        this.updateCommands(0);
        
    };
    
    this.updateCommands = function( add ) {
        
        // line number
        
        var nb = $('#sortable').children().length + (isNaN(add) ? 0 : add);
        $('#nb').empty();
        for(var i = 1; i <= nb; i++)
            $('#nb').append('<li><span class="nb">'+(('00'+String(i)).substring(String(i).length))+'</span></li>');
        
        $('#sortable')
            .prepend($('#sortable .start'))
            .append($('#sortable .end'));
        
        this.programReset();
        
    }
    
    this.programReset = function() {
        
        var mi = this;
        console.log(this.exec);
        if( this.exec == 'none' || this.exec != 'reset' ) {
        
            $('#stop').removeClass('active');
            
            this.program = [];
            this.playhead = -1;
            this.exec = 'reset';
            
            this.inboxConveyor.adds( this.data.samples, function(){
                $('#play').addClass('active');
                $('#stop').removeClass('active');
                $('#forward').removeClass('active');
                $('#reply').removeClass('active');
            });
            
            this.outboxConveyor.empty();
            
            $('.bonshomme .box').empty();
            
            $('.bonshomme')
                .stop()
                .animate(
                    this.bonshomme.start,
                    500,
                    function() {
                        console.log('end');
                    }
                );
            
            $( "#dialog" ).hide("scale", 100);
        }
        
    }
    
    this.frame = function () {
        
        var mi = this;
        
        console.log('status : '+this.exec);
        if( this.exec == 'run' ) {
            
            this.playhead ++;
            var mi = this;
            
            $('#play').removeClass('active');
            
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
                console.log(command);
                this[command+'Command']();
            }
            
        } else if (this.exec == 'standby') {
            setTimeout(function(){ mi.frame() }, 500);
        } else {
            this.programReset();
        }
        
    }
    
    this.startCommand = function () {
        this.frame();
    }
    
    this.inboxCommand = function () {
        
        var mi = this;
        
        $('.bonshomme').animate(
            this.bonshomme.inbox,
            500,
            function() {
                $('.bonshomme .box').empty();
                $('.bonshomme .box').append($('#inbox li:first-child'));
        
                mi.inboxConveyor.remove( function(){ mi.frame() });
            }
        );
    }

    this.outboxCommand = function () {
        
        var mi = this;
        
        
        $('.bonshomme').animate(
            this.bonshomme.outbox,
            500,
            function() {
                if( $('.bonshomme .box').children().length > 0 )
                    mi.outboxConveyor.add(function(){
                        $('#outbox').prepend($('.bonshomme .box li:first-child'));
                        $('.bonshomme .box').empty();
                        mi.frame();
                    });
                else mi.frame();
            }
        );
    }
    
    this.endCommand = function () {
        
        this.exec = 'standby';
        
        $('.bonshomme').animate(
            this.bonshomme.start,
            500,
            function() {
                console.log('end');
            }
        );
        
        this.check( function(){ mi.frame() });
    }
        
    this.check = function ( done ) {
        
        var mi = this;
        var preresult = $('#outbox').children();
        
        this.outboxConveyor.empty(function(){
            
            var result = [];
            
            for( var i = 0; i < preresult.length ; i++ )
                result[i] = Number($(preresult[i]).find('button').text());
            
            result = result.reverse();
            
            if (result.length < mi.data.solution.length)
                $( "#dialog" )
                    .empty()
                    .append(mi.message.errorToShort.replace('%s', mi.data.solution.length).replace('%d', result.length))
                    .show("scale", 100);
            else if (result.length > mi.data.solution.length)
                $( "#dialog" )
                    .empty()
                    .append(mi.message.errorToLong.replace('%s', mi.data.solution.length).replace('%d', result.length))
                    .show("scale", 100);
            else {
            
                var good = true;
                for (var i = 0, l = result.length; i < l; i++)
                    if( result[i] !== mi.data.solution[i] )
                        good = false;
                
                if (!good)
                    $( "#dialog" )
                        .empty()
                        .append(mi.message.errorBad)
                        .show("scale", 100);
                else
                    $( "#dialog" )
                        .empty()
                        .append(mi.message.next)
                        .show("scale", 100);
                
            }
            
            if (typeof done === "function") done();
        });
        
    }
}

function Conveyor (mode, elem) {
    
    this.value = '<li class=""><button class="value">%s</button></li>';
    
    this.mode = mode;
    this.elem = elem;
    this.pos = 0;
    this.decal = Number(elem.css('height').replace('px', ''));
    
    this.move = function ( add, time ) {
        
        var mi = this;
        
        this.pos += add;
        this.elem.animate(
            {
                'b-p':this.pos
            },{
                duration: time,
                ease: 'ease',
                step: function( now, fx ) {
                    $(fx.elem).css('background-position','0 '+now+'px')
                }
            }
        );
        
    }
    
    this.empty = function ( done ) {
        
        var mi = this;
        
        if( this.elem.children().length > 0 ) {
            
            this.move( this.decal, 1000 );
            
            this.elem.find('li:first-child').animate(
                {
                    'margin-top':this.decal+'px'
                },{
                    duration: 1000,
                    ease: 'ease',
                    done:function() {
                        mi.elem.empty();
                        if (typeof done === "function") done();
                    }
                }
            );
            
        } else if (typeof done === "function") done();
    }
    
    this.adds = function ( data, done ) {
        
        var mi = this;
        
        if( this.elem.children().length > 0 )
            this.empty(function(){ mi.adds( data, done ) });
        else {
            for( c in data ) {
                var val = $(this.value.replace("%s", data[c]));
                var bval = this.elem.append(val);
                val.css({transform:'rotate('+(Math.random()*5-2.5)+'deg)'});
                if(isNaN(data[c]))
                    val.addClass("string");
            }
            
            this.move( -this.decal, 1000 );
                
            this.elem.find('li:first-child').css('margin-top', this.decal+'px');
            this.elem.find('li:first-child').animate(
                {
                    'margin-top':'0'
                },{
                    duration: 1000,
                    ease: 'ease',
                    done:function() {
                        if (typeof done === "function") done();
                    }
                }
            );
        }
        
    }
    
    this.remove = function ( done ) {
        
        if( this.elem.children().length > 0 ) {
            
            this.elem.find('li:first-child').css('margin-top', '2.8em');
            if( Conveyor.ConveyorMin == undefined )
                Conveyor.ConveyorMin = Number(this.elem.find('li:first-child').css('margin-top').replace('px', ''));
            
            this.move( -Conveyor.ConveyorMin, 500 );
            
            this.elem.find('li:first-child').animate(
                {
                    'margin-top':'0em'
                },{
                    duration: 500,
                    ease: 'ease',
                    done:function() {}
                }
            );
                
            if (typeof done === "function") done();
            
        } else if (typeof done === "function") done();
        
    }
    
    this.add = function ( done ) {
        
        var mi = this;
        
        if( this.elem.children().length > 0 ) {
            this.move( Conveyor.ConveyorMin, 500 );
        
            this.elem.find('li:first-child').animate(
                {
                    'margin-top':'2.8em'
                },{
                    duration: 500,
                    ease: 'ease',
                    done:function() {
                        mi.elem.find('li:first-child').css('margin-top', '0em');
                        if (typeof done === "function") done();
                    }
                }
            );
        } else if (typeof done === "function") done();
        
    }
    
}
Conveyor.ConveyorMin = undefined;

$(function() { new main('A') });
