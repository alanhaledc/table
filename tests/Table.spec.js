/* eslint-disable no-undef */
import React from 'react';
import { render, mount } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import Table from '..';

describe('Table', () => {
  const data = [
    { key: 'key0', name: 'Lucy' },
    { key: 'key1', name: 'Jack' },
  ];
  const createTable = (props) => {
    const columns = [
      { title: 'Name', dataIndex: 'name', key: 'name' },
    ];

    return (
      <Table
        columns={columns}
        data={data}
        {...props}
      />
    );
  };

  it('renders correctly', () => {
    const wrapper = render(createTable({
      prefixCls: 'test-prefix',
      className: 'test-class-name',
    }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders without header', () => {
    const wrapper = render(createTable({ showHeader: false }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders fixed header correctly', () => {
    const wrapper = render(createTable({ useFixedHeader: true }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders title correctly', () => {
    const wrapper = render(createTable({ title: () => <p>title</p> }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders footer correctly', () => {
    const wrapper = render(createTable({ footer: () => <p>footer</p> }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders table body to the wrapper', () => {
    const getBodyWrapper = (body) => (
      <tbody className="custom-wapper">
        {body.props.children}
      </tbody>
    );
    const wrapper = render(createTable({ getBodyWrapper }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('sets row refs', () => {
    const wrapper = mount(createTable({ rowRef: (record) => record.key }));
    expect(wrapper.instance().refs.key0).toBe(wrapper.find('TableRow').at(0).node);
    expect(wrapper.instance().refs.key1).toBe(wrapper.find('TableRow').at(1).node);
  });

  describe('rowKey', () => {
    it('uses record.key', () => {
      const wrapper = mount(createTable());
      expect(wrapper.find('TableRow').at(0).prop('hoverKey')).toBe('key0');
      expect(wrapper.find('TableRow').at(1).prop('hoverKey')).toBe('key1');
    });

    it('sets by rowKey', () => {
      const wrapper = mount(createTable({ rowKey: 'name' }));
      expect(wrapper.find('TableRow').at(0).prop('hoverKey')).toBe('Lucy');
      expect(wrapper.find('TableRow').at(1).prop('hoverKey')).toBe('Jack');
    });

    it('sets by rowKey function', () => {
      const wrapper = mount(createTable({ rowKey: (record) => `${record.key}1` }));
      expect(wrapper.find('TableRow').at(0).prop('hoverKey')).toBe('key01');
      expect(wrapper.find('TableRow').at(1).prop('hoverKey')).toBe('key11');
    });
  });

  describe('scroll', () => {
    it('renders scroll.x is true', () => {
      const wrapper = render(createTable({ scroll: { x: true } }));
      expect(renderToJson(wrapper)).toMatchSnapshot();
    });

    it('renders scroll.x is a number', () => {
      const wrapper = render(createTable({ scroll: { x: 200 } }));
      expect(renderToJson(wrapper)).toMatchSnapshot();
    });

    it('renders scroll.y is a number', () => {
      const wrapper = render(createTable({ scroll: { y: 200 } }));
      expect(renderToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('row click', () => {
    it('fires row click event', () => {
      const onRowClick = jest.fn();
      const wrapper = mount(createTable({ onRowClick }));
      wrapper.find('tbody tr').first().simulate('click');
      const call = onRowClick.mock.calls[0];
      expect(call[0]).toBe(data[0]);
      expect(call[1]).toBe(0);
      expect(call[2].type).toBe('click');
    });

    it('fires double row click event', () => {
      const onRowDoubleClick = jest.fn();
      const wrapper = mount(createTable({ onRowDoubleClick }));
      wrapper.find('tbody tr').first().simulate('doubleClick');
      const call = onRowDoubleClick.mock.calls[0];
      expect(call[0]).toBe(data[0]);
      expect(call[1]).toBe(0);
      expect(call[2].type).toBe('doubleclick');
    });
  });

  it('renders column correctly', () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        className: 'name-class',
        width: 100,
      },
    ];
    const wrapper = render(createTable({ columns }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders custom cell correctly', () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <p>{text}</p>,
      },
    ];
    const wrapper = render(createTable({ columns }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('fires cell click event', () => {
    const onCellClick = jest.fn();
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        onCellClick,
      },
    ];
    const wrapper = mount(createTable({ columns }));
    wrapper.find('tbody td').first().simulate('click');
    expect(onCellClick.mock.calls[0][0]).toBe(data[0]);
    expect(onCellClick.mock.calls[0][1].type).toBe('click');
  });

  describe('dataIndex', () => {
    it('pass record to render when it\'s falsy', () => {
      [null, undefined, '', []].forEach(dataIndex => {
        const cellRender = jest.fn();
        const columns = [
          {
            title: 'Name',
            dataIndex,
            key: 'name',
            render: cellRender,
          },
        ];
        mount(createTable({ columns }));
        expect(cellRender).toBeCalledWith(data[0], data[0], 0);
      });
    });

    it('render text by path', () => {
      const columns = [
        { title: 'First Name', dataIndex: 'name.first', key: 'a' },
        { title: 'Last Name', dataIndex: 'name.last', key: 'b' },
      ];
      const localData = [
        { key: 'key0', name: { first: 'John', last: 'Doe' } },
        { key: 'key1', name: { first: 'Terry', last: 'Garner' } },
      ];
      const wrapper = render(createTable({ columns, data: localData }));
      expect(renderToJson(wrapper)).toMatchSnapshot();
    });
  });

  it('render empty cell if text is empty object', () => {
    const localData = [
      { key: 'key0', name: {} },
      { key: 'key1', name: 'Jack' },
    ];
    const wrapper = render(createTable({ data: localData }));
    expect(wrapper.find('table td').first().text()).toBe('');
  });

  it('renders colSpan correctly', () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'firstName',
        key: 'firstName',
        colSpan: 2,
        render: (text, record, index) => {
          const obj = {
            children: text,
            props: {},
          };
          if (index === 0) {
            obj.props.colSpan = 2;
          }
          return obj;
        },
      },
      {
        title: '',
        dataIndex: 'lastName',
        key: 'lastName',
        colSpan: 0,
        render: (text, record, index) => {
          const obj = {
            children: text,
            props: {},
          };
          if (index === 0) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },
    ];
    const localData = [
      { key: 'key0', firstName: 'John', lastName: 'Doe' },
      { key: 'key1', firstName: 'Terry', lastName: 'Garner' },
    ];
    const wrapper = render(createTable({ columns, data: localData }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('renders rowSpan correctly', () => {
    const columns = [
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',
        render: (text, record, index) => {
          const obj = {
            children: text,
            props: {},
          };
          if (index === 0) {
            obj.props.rowSpan = 2;
          } else {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      },
    ];
    const localData = [
      { key: 'key0', firstName: 'John', lastName: 'Doe' },
      { key: 'key1', firstName: 'Terry', lastName: 'Garner' },
    ];
    const wrapper = render(createTable({ columns, data: localData }));
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('shows error if no rowKey specify', () => {
    console.error = jest.fn();
    const localData = [
      { name: 'Lucy' },
      { name: 'Jack' },
    ];
    mount(createTable({ data: localData }));
    expect(console.error).toBeCalledWith(
      'Warning: Each record in table should have a unique `key` prop,' +
      'or set `rowKey` to an unique primary key.'
    );
  });

  describe('resetScrollX', () => {
    beforeEach(() => {
      Table.prototype.resetScrollX = jest.fn();
    });

    it('is called if scroll.x is present', () => {
      mount(createTable({ scroll: { x: 100 } }));
      expect(Table.prototype.resetScrollX).toHaveBeenCalled();
    });

    it('is not called if scroll.x is absent', () => {
      mount(createTable());
      expect(Table.prototype.resetScrollX).not.toHaveBeenCalled();
    });
  });
});