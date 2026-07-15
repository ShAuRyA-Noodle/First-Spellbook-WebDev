import { Link, useParams } from 'react-router-dom'
import users from '../data/users'
import UsernameJump from './UsernameJump'

const User = () => {
  const { username } = useParams()
  const profile = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  )
  const others = users.filter((user) => user.username !== profile?.username).slice(0, 4)

  return (
    <div className="page">
      <p className="eyebrow" translate="no">/user/{username}</p>

      {profile ? (
        <div className="profile-card">
          <span
            className="avatar avatar-lg"
            style={{
              backgroundColor: `${profile.color}22`,
              color: profile.color,
              borderColor: `${profile.color}55`,
            }}
          >
            {profile.name.split(' ').map((part) => part[0]).join('')}
          </span>
          <h1>{profile.name}</h1>
          <p className="profile-role">{profile.role}</p>
          <p className="profile-bio">{profile.bio}</p>
        </div>
      ) : (
        <div className="profile-card profile-card-empty">
          <h1>No preset profile for &ldquo;{username}&rdquo;</h1>
          <p>
            There&rsquo;s no bio on file for this handle, but the route still
            matched &mdash; that&rsquo;s the point. <code>useParams()</code> handed
            the router &ldquo;{username}&rdquo; straight through, no extra work required.
          </p>
        </div>
      )}

      <div className="section">
        <p className="section-label">Try another profile</p>
        <div className="chip-row">
          {others.map((user) => (
            <Link className="chip" to={`/user/${user.username}`} key={user.username} translate="no">
              {user.username}
            </Link>
          ))}
        </div>
        <UsernameJump label="Or jump to any handle" />
      </div>
    </div>
  )
}

export default User
