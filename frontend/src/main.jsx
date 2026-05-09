import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ProductCard from './ejemplos/ProductCard.jsx'
import TwitterCard from './ejemplos/TwitterFollowCard.jsx'
import Video from './ejemplos/Video.jsx'
import OnOff from './ejemplos/OnOff.jsx'
import Card from './ejemplos/Card.jsx'
import ProductList from './components/ProductList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <p>hola mundo</p> */}
    {/* <ProductCard /> */}
    <ProductList />
    {/* <TwitterCard userName='jperez' initialIsFollowing={false} >
      @ssanchez
    </TwitterCard> */}
    {/* <OnOff /> */}
    {/* <Card userName='jsuarez' onFollow='false' formatUserName={(name) => name.toLowerCase()}>
    </Card>
    <Card userName='ssanchez' onFollow='false' formatUserName={(name) => name.toUpperCase()}>
      <p>Me gusta los deportes de montaña</p>
    </Card>

    <Card userName='hsuarez' onFollow='false' formatUserName={(name) => name.toUpperCase()}>
      <h4>Hugo Suárez</h4>
      <p>Me gusta los deportes de montaña</p>
      <a href="">Link a mi perfil de facebook</a>
      <OnOff />
    </Card>
 */}
    {/* <Card userName='nsanchez' onFollow='true' formatUserName={(name) => name.toUpperCase()}>
    </Card> */}
    {/* <Card userName='jperez' onFollow='true' formatUserName={(name) => name.toUpperCase()}>
      <p>Me gustan la tecnología</p>
      <div>
        <a href="">Link a Facebook</a>
        <a href="">Link a Instagram</a>
      </div>
      <OnOff />
    </Card>
    <Card userName='hperez' onFollow='true' formatUserName={(name) => name.toUpperCase()}>
      <p>Me gustan viajar</p>
      <OnOff />
    </Card>     */}

  </StrictMode>,
)
