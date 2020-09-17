import React, { useState } from 'react';
import { Button, Menu, Transition } from "semantic-ui-react";


function Header(props) {
    const [visible, setVisibility]=useState(true)
    const toggleVisibility = () => {
          setVisibility(true)
    }    
    
    return (
        <Menu secondary fixed="top" className="header bg-white">
            <Menu.Item>
                <Transition
                    animation={"pulse"}
                    duration={500}
                    visible={visible}
                >
                    <Button icon="bars" size="large" style={{background: "transparent"}} onClick={props.toggleVisibiltiy} />
                </Transition>
                
                <a className="primary h1" href="#home">Mero Edu</a>
            </Menu.Item>
            <Menu.Menu position='right'>
            <Menu.Item>
                <Button icon="bell" className="bg-white"/>
            </Menu.Item>
            <Menu.Item>
                <Button icon="ellipsis vertical" className="bg-white"/>
            </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
}

export default Header;
