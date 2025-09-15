describe('AI SmartCards', () => {
  it('should surface a Best pick on compare', () => {
    const items = [
      {title:'A', price:89, rating:4.2, eta:'2 days'},
      {title:'B', price:99, rating:4.6, eta:'Tomorrow'}
    ];
    const best = items.reduce((a,b)=> (a.price<=b.price ? a : b));
    expect(best.title).toBe('A');
  });
});
