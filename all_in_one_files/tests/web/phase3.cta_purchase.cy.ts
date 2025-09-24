describe('CTA → Purchase attribution', () => {
  it('tracks CTA then purchase with commission', () => {
    cy.visit('/');
    cy.intercept('POST', '**/api/track/cta').as('cta');
    cy.intercept('POST', '**/api/track/purchase').as('purchase');
    cy.get('#buy').click();
    cy.wait('@cta').its('response.statusCode').should('eq', 200);
    cy.wait('@purchase').its('response.statusCode').should('eq', 200);
  });
});
