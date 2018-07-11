import { applit } from 'applit';
import { html, render } from 'lit-html';
import { map, reduce, times } from 'lodash';

const onDragstart = (event) => (state) => {
	const key = event.target.getAttribute('key');
	console.log('drag started on', key);

	event.dataTransfer.setData(key, key);
	event.dataTransfer.setDragImage(document.createElement('span'), 0, 0);

	return {
		...state,
		dragStart: key,
		slots: {
			...state.slots,
			[key]: {
				...state.slots[key],
				isEvent: true
			}
		}
	};
};

const onDrop = (event) => (state) => {
	const key = event.target.getAttribute('key');
	console.log('dropped on', key);
	return {
		...state,
		dragOver: key,
		slots: reduce(
			state.slots,
			(acc, slot, idx) => {
				if (
					(slot.id >= state.dragStart && slot.id <= key) ||
					(slot.id <= state.dragStart && slot.id >= key)
				) {
					acc[slot.id]['isEvent'] = state.nextEventId;
				} else if (!acc[slot.id]['isEvent']) {
					// do nothing, leave isEvent alone
					acc[slot.id]['isEvent'] = false;
				}
				return acc;
			},
			state.slots
		),
		nextEventId: state.nextEventId + 1
	};
};

const onDragover = (event) => (state) => {
	const key = event.target.getAttribute('key');
	if (event.dataTransfer.types.includes(key)) {
		event.preventDefault();
		return { ...state };
	}
	event.preventDefault();
	return {
		...state,
		dragOver: key,
		slots: reduce(
			state.slots,
			(acc, slot, idx) => {
				if (
					(slot.id >= state.dragStart && slot.id <= key) ||
					(slot.id <= state.dragStart && slot.id >= key)
				) {
					acc[slot.id]['isEvent'] = true;
				} else if (!acc[slot.id]['isEvent']) {
					// do nothing, leave isEvent alone
					acc[slot.id]['isEvent'] = false;
				}
				return acc;
			},
			state.slots
		)
	};
};

const onDragend = (event) => (state) => {
	return {
		...state,
		slots: reduce(
			state.slots,
			(acc, slot, idx) => {
				if (acc[slot.id]['isEvent'] === true) {
					// do nothing, leave isEvent alone
					acc[slot.id]['isEvent'] = false;
				}
				return acc;
			},
			state.slots
		),
		nextEventId: state.nextEventId + 1
	};
};

const table = (bind, state) => html`<table>
      ${map(
				state.slots,
				(slot, idx) =>
					html`
      <tr>
        <td draggable="true" 
          ondragstart=${bind(onDragstart)} 
          ondragenter=${bind(onDragover)}
          ondragover=${bind(onDragover)}
					ondrop=${bind(onDrop)}
					ondragend=${bind(onDragend)}
					key=${slot.id}
					style="background: ${slot.isEvent ? 'lightblue' : ''}"
          >
          ${slot.id}: ${slot.isEvent}
          </td>
      </tr>`
			)}
    </table>`;

const style = html`
    <style>
      tr td {
        width: 200px;
				border-top: 1px solid black;
				border-right: 1px solid black;
				border-left: 1px solid black;
			}

			table tr:last-child td {
        width: 200px;
				border-bottom: 1px solid black;
			}

			table {
				border-spacing: 0;
			}
    </style>
  `;

const stateDebugger = (state) =>
	html`<pre>${JSON.stringify(state, null, 2)}</pre>`;

const view = (bind, state) =>
	html`${style}${table(bind, state)}${stateDebugger(state)}`;

const init = () => ({
	dragStart: '',
	dragOver: '',
	dragEnd: '',
	nextEventId: 1,
	slots: times(20).reduce((acc, _, x) => {
		acc[x] = {
			id: x,
			isEvent: false
		};

		return acc;
	}, {})
});

applit(init, view);
