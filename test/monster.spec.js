describe('monster', function () {

    describe('Global access', function () {

        it('monster namespace available', function () {
            expect(typeof window.monster).toBe('object');
        });

        it('view method available', function () {
            expect(typeof window.monster.view).toBe('function');
        });
    });

    describe('Binding', function () {
        var tmp, tmpTwo, view, viewTwo, h1, h2, p1, p2, p3,
            a1, a2, ul1, ul2, ul3, span1, span2, span3,
            data = {
                name: {
                    first: 'Eddie',
                    last: 'Vedder'
                },
                band: 'Pearl Jam',
                siteName: 'Bio',
                siteUrl: 'http://pearljam.com/band/eddie',
                noSocial: true,
                albumsThisYear: 0,
                nextTourDate: null,
                hasSoloAlbums: true,
                songs: [ 
                    {
                        title: 'Black',
                        album: 'Ten'
                    },
                    {
                        title: 'Do The Evolution',
                        album: 'Yield'
                    },
                    {
                        title: 'Hard Sun',
                        album: 'Into The Wild'
                    }
                ],
                albums: {
                    ten:  {
                        title: 'Ten',
                        year: 1992
                    },
                    intoTheWild: {
                        title: 'Into The Wild',
                        year: 2007
                    }
                },
                status: 'on_tour'
            },
            dataTwo = {
                mike: {
                    name: 'Mike McCready',
                    plays: 'Guitar'
                },
                jeff: {
                    name: 'Jeff Ament',
                    plays: 'Bass'
                },
                stone: {
                    name: 'Stone Gossard',
                    plays: 'Guitar'
                },
                matt: {
                    name: 'Matt Cameron',
                    plays: 'Drums'
                }
            };

        beforeEach(function () {
            // create template element
            tmp = document.createElement('div');
            tmp.id = 'template';

            // create one moretemplate element
            tmpTwo = document.createElement('div');
            tmpTwo.id = 'template-two';

            // multi level text binding
            h1 = document.createElement('h1');
            h1.setAttribute('mns-text', 'person.name.first');
            tmp.appendChild(h1);

            h2 = document.createElement('h2');
            h2.setAttribute('mns-text', 'person.name.last');
            tmp.appendChild(h2);

            // simple level text binding
            p1 = document.createElement('p');
            p1.setAttribute('mns-text', 'person.band');
            tmp.appendChild(p1);

            // simple level text binding for 0 value
            p3 = document.createElement('p');
            p3.setAttribute('mns-text', 'person.albumsThisYear');
            tmp.appendChild(p3);

            // bind null value
            span3 = document.createElement('span');
            span3.setAttribute('mns-text', 'person.nextTourDate');
            tmp.appendChild(span3);

            // show binding
            p2 = document.createElement('p');
            p2.innerHTML = 'He has solo albums!'
            p2.setAttribute('mns-show', 'person.hasSoloAlbums');
            tmp.appendChild(p2);

            // attr and text binding in the same element
            a1 = document.createElement('a');
            a1.setAttribute('mns-attr-href', 'person.siteUrl');
            a1.setAttribute('mns-text', 'person.siteName');
            tmp.appendChild(a1);

            // each binding for arrays
            ul1 = document.createElement('ul')
            ul1.setAttribute('mns-each-songs', 'song');
            ul1.innerHTML = '<li mns-text="song.title"></li>';
            tmp.appendChild(ul1);

            // each binding for obj
            ul2 = document.createElement('ul')
            ul2.setAttribute('mns-each-albums', 'album');
            ul2.innerHTML = '<li><span mns-text="album.title"></span></li>';
            tmp.appendChild(ul2);

            // binding with no data and hide binding
            a2 = document.createElement('a');
            a2.setAttribute('mns-hide', 'person.noSocial');
            a2.setAttribute('mns-attr-title', 'person.twitter');
            tmp.appendChild(a2);

            // class binding
            span1 = document.createElement('span');
            span1.innerHTML = 'ON TOUR';
            span1.setAttribute('mns-class', 'person.status');
            tmp.appendChild(span1);

            span2 = document.createElement('span');
            span2.className = 'tour-icon';
            span2.setAttribute('mns-class', 'person.status');
            tmp.appendChild(span2);

            ul3 = document.createElement('ul');
            ul3.setAttribute('mns-each-bandmates', 'mate');
            ul3.innerHTML = '<li>' +
                '<span mns-text="mate.name"></span>' +
                '<span mns-text="mate.plays"></span>' +
                '</li>';
            tmpTwo.appendChild(ul3);

            // append templates to body
            document.body.appendChild(tmp);
            document.body.appendChild(tmpTwo);

            // bind views
            view = monster.view(tmp, {
                context: 'person',
                model: data
            });

            viewTwo = monster.view(tmpTwo, {
                context: 'bandmates',
                model: dataTwo
            });
        });
        afterEach(function () {
            document.body.innerHTML = '';
        });
        describe('[mns-text]', function () {
            it('simple level text binding', function () {
                expect(p1.innerHTML).toBe(data.band);
            });
            it('simple level text binding for 0 value', function () {
                expect(p3.innerHTML).toBe('0');
            });
            it('simple level text binding for null value', function () {
                expect(span3.innerHTML).toBe('');
            });
            it('multi level text binding', function () {
                expect(h1.innerHTML).toBe(data.name.first);
                expect(h2.innerHTML).toBe(data.name.last);
            });
        });
        describe('[mns-show] and [mns-hide]', function () {
            it('show binding', function () {
                expect(p2.style.display).toBe('block');
            });
            it('hide binding', function () {
                expect(a2.style.display).toBe('none');
            });
        });
        describe('[mns-attr-*]', function () {
            it('attribute binding', function () {
                expect(a1.href).toBe(data.siteUrl);
            });
            it('attr binding with no data available', function () {
                expect(a2.title).toBe('');
            });
            it('text and attr binding together', function () {
                expect(a1.innerHTML).toBe(data.siteName);
            });
        });
        describe('[mns-each]', function () {
            it('each binding on arrays', function () {
                expect(ul1.children.length).toBe(3);
                expect(ul1.children[0].innerHTML).toBe(data.songs[0].title);
                expect(ul1.children[1].innerHTML).toBe(data.songs[1].title);
                expect(ul1.children[2].innerHTML).toBe(data.songs[2].title);
            });
            it('each binding for objects', function () {
                expect(ul2.children.length).toBe(2);
                expect(ul2.children[0].querySelector('span').innerHTML).toBe(data.albums.ten.title);
                expect(ul2.children[1].querySelector('span').innerHTML).toBe(data.albums.intoTheWild.title);
            });
            it('each binding for array-like base objects', function () {
                expect(ul3.children.length).toBe(4);
            });
        });
        describe('[mns-class]', function () {
            it('class binding', function () {
                expect(span1.className).toBe(data.status);
            });
            it('class binding on an element with a class already', function () {
                expect(span2.className).toBe('tour-icon ' + data.status);
            });
        })
    });
    describe('Update', function () {
        var tmp, el, v,
            data =  {
                type: 'bird'
            };

        beforeEach(function () {
            // create template element
            tmp = document.createElement('div');
            tmp.id = 'template';

            el = document.createElement('p');
            el.setAttribute('mns-text', 'animal.type');
            tmp.appendChild(el);

            v = monster.view(tmp, {
                context: 'animal',
                model: data
            });

            data.type = 'insect';

            v.update();
        });
        afterEach(function () {
            document.body.innerHTML = '';
        });
        it('update text binding', function () {
            expect(el.innerHTML).toBe('insect');
        });
    })
});