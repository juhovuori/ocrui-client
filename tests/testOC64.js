casper.echo( "OC-64: Editoitavan itemin tekijä ja otsikko näkyvät oikein" );

var selector = '#bib-info';

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.waitForSelector(selector,undefined,function() {
    casper.echo( 'not found.' );
    casper.echo( casper.page.content );
});

casper.then(function() {


    this.test.assertExists(selector)
    var bibinfo = this.getElementInfo(selector + ' a');
    var text = bibinfo.text;
    var expected = settings.testAuthor + ': ' + settings.testTitle
    this.test.assertEqual(text,expected,'Correct bibinfo');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});

