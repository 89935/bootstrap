import Collapse from './collapse'
import EventHandler from '../dom/eventHandler'

/** Test helpers */
import { getFixture, clearFixture } from '../../tests/helpers/fixture'

fdescribe('Collapse', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Collapse.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Collapse.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('toggle', () => {
    it('should call show method if show class is not present', () => {
      fixtureEl.innerHTML = '<div></div>'

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl)

      spyOn(collapse, 'show')

      collapse.toggle()

      expect(collapse.show).toHaveBeenCalled()
    })

    it('should call hide method if show class is present', () => {
      fixtureEl.innerHTML = '<div class="show"></div>'

      const collapseEl = fixtureEl.querySelector('.show')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      spyOn(collapse, 'hide')

      collapse.toggle()

      expect(collapse.hide).toHaveBeenCalled()
    })
  })

  describe('show', () => {
    it('should do nothing if is transitioning', () => {
      fixtureEl.innerHTML = '<div></div>'

      spyOn(EventHandler, 'trigger')

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      collapse._isTransitioning = true
      collapse.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should do nothing if already shown', () => {
      fixtureEl.innerHTML = '<div class="show"></div>'

      spyOn(EventHandler, 'trigger')

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      collapse.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should show a collapsed element', done => {
      fixtureEl.innerHTML = '<div class="collapse" style="height: 0px;"></div>'

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      collapseEl.addEventListener('show.bs.collapse', () => {
        expect(collapseEl.style.height).toEqual('0px')
      })
      collapseEl.addEventListener('shown.bs.collapse', () => {
        expect(collapseEl.classList.contains('show')).toEqual(true)
        expect(collapseEl.style.height).toEqual('')
        done()
      })

      collapse.show()
    })

    it('should collapse only the first collapse', done => {
      fixtureEl.innerHTML = [
        '<div class="card" id="accordion1">',
        '  <div id="collapse1" class="collapse"/>',
        '</div>',
        '<div class="card" id="accordion2">',
        '  <div id="collapse2" class="collapse show"/>',
        '</div>'
      ].join('')

      const el1 = fixtureEl.querySelector('#collapse1')
      const el2 = fixtureEl.querySelector('#collapse2')
      const collapse = new Collapse(el1, {
        toggle: false
      })

      el1.addEventListener('shown.bs.collapse', () => {
        expect(el1.classList.contains('show')).toEqual(true)
        expect(el2.classList.contains('show')).toEqual(true)
        done()
      })

      collapse.show()
    })

    it('should not fire shown when show is prevented', done => {
      fixtureEl.innerHTML = '<div class="collapse"></div>'

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      const expectEnd = () => {
        setTimeout(() => {
          expect().nothing()
          done()
        }, 10)
      }

      collapseEl.addEventListener('show.bs.collapse', e => {
        e.preventDefault()
        expectEnd()
      })

      collapseEl.addEventListener('shown.bs.collapse', () => {
        throw new Error('should not fire shown event')
      })

      collapse.show()
    })
  })

  describe('hide', () => {
    it('should hide a collapsed element', done => {
      fixtureEl.innerHTML = '<div class="collapse show"></div>'

      const collapseEl = fixtureEl.querySelector('div')
      const collapse = new Collapse(collapseEl, {
        toggle: false
      })

      collapseEl.addEventListener('hidden.bs.collapse', () => {
        expect(collapseEl.classList.contains('show')).toEqual(false)
        expect(collapseEl.style.height).toEqual('')
        done()
      })

      collapse.hide()
    })
  })

  describe('data-api', () => {
    it('should show multiple collapsed elements', done => {
      fixtureEl.innerHTML = [
        '<a role="button" data-toggle="collapse" class="collapsed" href=".multi"></a>',
        '<div id="collapse1" class="collapse multi"/>',
        '<div id="collapse2" class="collapse multi"/>'
      ].join('')

      const trigger = fixtureEl.querySelector('a')
      const collapse1 = fixtureEl.querySelector('#collapse1')
      const collapse2 = fixtureEl.querySelector('#collapse2')

      collapse2.addEventListener('shown.bs.collapse', () => {
        expect(trigger.getAttribute('aria-expanded')).toEqual('true')
        expect(trigger.classList.contains('collapsed')).toEqual(false)
        expect(collapse1.classList.contains('show')).toEqual(true)
        expect(collapse1.classList.contains('show')).toEqual(true)
        done()
      })

      trigger.click()
    })

    it('should hide multiple collapsed elements', done => {
      fixtureEl.innerHTML = [
        '<a role="button" data-toggle="collapse" href=".multi"></a>',
        '<div id="collapse1" class="collapse multi show"/>',
        '<div id="collapse2" class="collapse multi show"/>'
      ].join('')

      const trigger = fixtureEl.querySelector('a')
      const collapse1 = fixtureEl.querySelector('#collapse1')
      const collapse2 = fixtureEl.querySelector('#collapse2')

      collapse2.addEventListener('hidden.bs.collapse', () => {
        expect(trigger.getAttribute('aria-expanded')).toEqual('false')
        expect(trigger.classList.contains('collapsed')).toEqual(true)
        expect(collapse1.classList.contains('show')).toEqual(false)
        expect(collapse1.classList.contains('show')).toEqual(false)
        done()
      })

      trigger.click()
    })

    it('should remove "collapsed" class from target when collapse is shown', done => {
      fixtureEl.innerHTML = [
        '<a id="link1" role="button" data-toggle="collapse" class="collapsed" href="#" data-target="#test1" />',
        '<a id="link2" role="button" data-toggle="collapse" class="collapsed" href="#" data-target="#test1" />',
        '<div id="test1"></div>'
      ].join('')

      const link1 = fixtureEl.querySelector('#link1')
      const link2 = fixtureEl.querySelector('#link2')
      const collapseTest1 = fixtureEl.querySelector('#test1')

      collapseTest1.addEventListener('shown.bs.collapse', () => {
        expect(link1.getAttribute('aria-expanded')).toEqual('true')
        expect(link2.getAttribute('aria-expanded')).toEqual('true')
        expect(link1.classList.contains('collapsed')).toEqual(false)
        expect(link2.classList.contains('collapsed')).toEqual(false)
        done()
      })

      link1.click()
    })

    it('should add "collapsed" class to target when collapse is hidden', done => {
      fixtureEl.innerHTML = [
        '<a id="link1" role="button" data-toggle="collapse" href="#" data-target="#test1" />',
        '<a id="link2" role="button" data-toggle="collapse" href="#" data-target="#test1" />',
        '<div id="test1" class="show"></div>'
      ].join('')

      const link1 = fixtureEl.querySelector('#link1')
      const link2 = fixtureEl.querySelector('#link2')
      const collapseTest1 = fixtureEl.querySelector('#test1')

      collapseTest1.addEventListener('hidden.bs.collapse', () => {
        expect(link1.getAttribute('aria-expanded')).toEqual('false')
        expect(link2.getAttribute('aria-expanded')).toEqual('false')
        expect(link1.classList.contains('collapsed')).toEqual(true)
        expect(link2.classList.contains('collapsed')).toEqual(true)
        done()
      })

      link1.click()
    })

    it('should allow accordion to use children other than card', done => {
      fixtureEl.innerHTML = [
        '<div id="accordion">',
        '  <div class="item">',
        '    <a id="linkTrigger" data-toggle="collapse" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne"></a>',
        '    <div id="collapseOne" class="collapse" role="tabpanel" aria-labelledby="headingThree" data-parent="#accordion"></div>',
        '  </div>',
        '  <div class="item">',
        '    <a id="linkTriggerTwo" data-toggle="collapse" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo"></a>',
        '    <div id="collapseTwo" class="collapse show" role="tabpanel" aria-labelledby="headingTwo" data-parent="#accordion"></div>',
        '  </div>',
        '</div>'
      ].join('')

      const trigger = fixtureEl.querySelector('#linkTrigger')
      const triggerTwo = fixtureEl.querySelector('#linkTriggerTwo')
      const collapseOne = fixtureEl.querySelector('#collapseOne')
      const collapseTwo = fixtureEl.querySelector('#collapseTwo')

      collapseOne.addEventListener('shown.bs.collapse', () => {
        expect(collapseOne.classList.contains('show')).toEqual(true)
        expect(collapseTwo.classList.contains('show')).toEqual(false)

        collapseTwo.addEventListener('shown.bs.collapse', () => {
          expect(collapseOne.classList.contains('show')).toEqual(false)
          expect(collapseTwo.classList.contains('show')).toEqual(true)
          done()
        })

        triggerTwo.click()
      })

      trigger.click()
    })

    it('should not prevent event for input', done => {
      fixtureEl.innerHTML = [
        '<input type="checkbox" data-toggle="collapse" data-target="#collapsediv1" />',
        '<div id="collapsediv1"></div>'
      ].join('')

      const target = fixtureEl.querySelector('input')
      const collapseEl = fixtureEl.querySelector('#collapsediv1')

      collapseEl.addEventListener('shown.bs.collapse', () => {
        expect(collapseEl.classList.contains('show')).toEqual(true)
        expect(target.checked).toEqual(true)
        done()
      })

      target.click()
    })
  })
})
