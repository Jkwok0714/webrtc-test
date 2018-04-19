import * as React from 'react';

export default class UserListComponent extends React.Component {
    render () {
        const { userList } = this.props;
        return (
            <div className='user-list'>
                {userList.map(user => {
                    return <div className="user-list-item" onClick={() => this.props.handleSetOtherPeer(user)} >
                        {user}
                      </div>;
                })}
            </div>
        );
    }
}