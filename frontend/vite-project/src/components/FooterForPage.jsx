import React from "react";
import { Footer } from "flowbite-react";

const FooterForPage = () => {
  return (
    <Footer container className="bg-[#F9F0D0] text-gray-800">
      <Footer.Copyright href="#" by="Flowbite™" year={2022} />
      <Footer.LinkGroup>
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
      </Footer.LinkGroup>
    </Footer>
  );
};

export default FooterForPage;
