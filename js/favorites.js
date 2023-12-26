import { GitHubUser } from './GitHubUser.js'

//Classe que contém a lógica dos dados
class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-fav:')) || []

  }

  save() {
    localStorage.setItem('@github-fav:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        this.inputSearch.value = ''
        this.inputSearch.focus()
        throw new Error(`Usuário ${username} já cadastrado como favorito!`)
      }

      const user = await GitHubUser.search(username)

      if (user.login == undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

//Classe que cria a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.inputSearch = this.root.querySelector('.input-wrapper input')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.input-wrapper button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.input-wrapper input')

      this.add(value)
    }
  }

  //Essa função vai ser chamada todas vez que adicionar, remover ou carregar um favorito
  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.creatRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm(`Deseja remover ${user.name}, dos favoritos?`)
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
      this.inputSearch.value = ''

      this.empty()
   })
  }

  //Cria as linhas da tabela
  creatRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/diegoscavone.png" alt="" />
      <a href="https://github.com/diegoscavone" target="_blank">
        <p>Diego Scavone</p>
        <span>/diegoscavone</span>
      </a>
    </td>
    <td class="repositories">76</td>
    <td class="followers">9589</td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `
    return tr
  }

  //Remove as linhas
  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
      this.empty()
    })
  }

  empty() {
    const empty = this.root.querySelector('.messageFav')

    if(this.entries.length === 0){
      empty.classList.remove('hide')
    } else {
      empty.classList.add('hide')
    }
  }
}
