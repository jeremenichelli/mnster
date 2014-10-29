describe('monster', function () {

    describe('Global access', function () {

        it('monster namespace available', function () {
            expect(typeof window.monster).toBe('object');
        });

        it('view method available', function () {
            expect(typeof window.monster.view).toBe('function');
        });
    });
});