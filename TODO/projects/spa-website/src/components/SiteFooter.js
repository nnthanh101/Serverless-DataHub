
import React from 'react';
import LegalFooter from './LegalFooter';
import PageList from './PageList';

const SiteFooter = () => {
  return (
    <footer className="site-footer">
      <div className="row column">
        <nav className="footer-nav">
          <PageList/>
        </nav>
      </div>
      <LegalFooter/>
    </footer>
  );
};

export default SiteFooter;
